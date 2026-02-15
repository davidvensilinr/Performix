import {prisma} from '../prisma';
export async function addOrganisation(data:{
    name:string,
    managed_by:string
}){
    return await prisma.organisation.create({data});
}
export async function getAllOrganisation(){
    return await prisma.organisation.findMany();
}