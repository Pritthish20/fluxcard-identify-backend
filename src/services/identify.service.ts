import prisma from "../config/db";
import { LinkPrecedence } from "../generated/prisma/enums";
import { idetifyUserInput } from "../schema/identify.schema";

interface contactsResponse {
    primaryContactId: number;
    emails: string[];
    phoneNumbers: string[];
    secondaryContactIds: number[];
}

export const processContacts = async (
    input: idetifyUserInput
): Promise<contactsResponse> =>{

    const { email, phoneNumber } = input;

    const orConditions = [];

    if (email) orConditions.push({ email });
    if (phoneNumber) orConditions.push({ phoneNumber });

    const matchedContacts = orConditions.length > 0 ? await prisma.contact.findMany({
        where: { OR: orConditions },
        orderBy: { createdAt: "asc" },
    }) : [];

    //case 1 No existing contacts

    if (matchedContacts.length === 0) {
        const newContact = await prisma.contact.create({
            data: {
                email: email ?? null,
                phoneNumber: phoneNumber ?? null,
                linkedId: null,
                linkPrecedence: LinkPrecedence.primary,
            },
        });

        return {
            primaryContactId: newContact.id,
            emails: newContact.email ? [newContact.email] : [],
            phoneNumbers: newContact.phoneNumber ? [newContact.phoneNumber] : [],
            secondaryContactIds: [],
        }
    }

    //case 2 contact exists (resolve cluster)

    const primaryIds = new Set<number>();

    for (const contact of matchedContacts) {
        if (contact.linkPrecedence === LinkPrecedence.primary) {
            primaryIds.add(contact.id);
        }
        else if (contact.linkedId) {
            primaryIds.add(contact.linkedId);
        }
    }

    let relatedContacts = await prisma.contact.findMany({
        where: {
            OR: [
                { id: { in: Array.from(primaryIds) } },
                { linkedId: { in: Array.from(primaryIds) } }
            ]
        },
        orderBy: { createdAt: "asc" },
    });

    //finding the oldest record

    const primaries = relatedContacts.filter(
        (c) => c.linkPrecedence === LinkPrecedence.primary
    );

    const oldestPrimary = primaries.sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    )[0];


    //merge primary


    const otherPrimaries = primaries.filter((p) => p.id !== oldestPrimary.id)

    if (otherPrimaries.length > 0) {
        await prisma.$transaction(
            otherPrimaries.map((p) =>
                prisma.contact.update({
                    where: { id: p.id },
                    data: {
                        linkPrecedence: LinkPrecedence.secondary,
                        linkedId: oldestPrimary.id,
                    }
                }
                ))
        )

        relatedContacts = await prisma.contact.findMany({
            where: {
                OR: [{ id: oldestPrimary.id }, { linkedId: oldestPrimary.id }]
            },
            orderBy: { createdAt: "asc" },
        });
    };

    //check for new info

    const emailExists = email ? relatedContacts.some((c) => c.email === email) : true;
    const phoneExists = phoneNumber ? relatedContacts.some((c) => c.phoneNumber === phoneNumber) : true;

    if (!emailExists || !phoneExists) {
        await prisma.contact.create({
            data: {
                email: email ?? null,
                phoneNumber: phoneNumber ?? null,
                linkedId: oldestPrimary.id,
                linkPrecedence: LinkPrecedence.secondary,
            },
        });

        relatedContacts = await prisma.contact.findMany({
            where: {
                OR: [{ id: oldestPrimary.id }, { linkedId: oldestPrimary.id }],
            },
            orderBy: { createdAt: "asc" }
        });
    }

    return buildResponse(relatedContacts, oldestPrimary.id);

}

const buildResponse = (
    contacts: any[],
    primaryId: number
): contactsResponse => {

    const primary = contacts.find((c) => c.id === primaryId);

    const emails = new Set<string>();
    const phones = new Set<string>();

    const secondaryIds: number[] = [];

    if (primary.email) emails.add(primary.email);
    if (primary.phoneNumber) phones.add(primary.phoneNumber);

    for (const contact of contacts) {
        if (contact.id !== primaryId) secondaryIds.push(contact.id);
        if (contact.email) emails.add(contact.email);
        if (contact.phoneNumber) phones.add(contact.phoneNumber);
    }

    return {
        primaryContactId: primaryId,
        emails: Array.from(emails),
        phoneNumbers: Array.from(phones),
        secondaryContactIds: secondaryIds,
    }
}