import {prisma} from '../prisma';
export async function getAllOrganisation(){
    return await prisma.organisation.findMany();
}