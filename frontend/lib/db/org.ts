import { prisma } from '../prisma';

export async function addOrganisation(data: {
    name: string;
    managed_by: string;
    user_id?: string;
}) {
    return await prisma.organisation.create({ data });
}

export async function getAllOrganisation(userId?: string) {
    return await prisma.organisation.findMany({
        where: userId ? { user_id: userId } : undefined,
        orderBy: { id: 'asc' },
    });
}

export async function getOrgById(id: number) {
    return await prisma.organisation.findUnique({ where: { id } });
}
