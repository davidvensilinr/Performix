import { prisma } from '../prisma';

export async function addOrganisation(data: {
    name: string,
    managed_by: string
}) {
    return await prisma.organisation.create({ data });
}

export async function getAllOrganisation() {
    return await prisma.organisation.findMany();
}

export async function getOrgById(id: number) {
    return await prisma.organisation.findUnique({ where: { id } });
}