import { prisma } from '../prisma';

export async function addEmployee(data: {
    emp_name: string;
    orgId: number;
    tasks?: number | null;
    deadline_met?: number | null;
    averagetime?: number | null;
}) {
    return await prisma.employees.create({
        data: {
            emp_name: data.emp_name,
            orgid: data.orgId,
            tasks: data.tasks ?? null,
            deadline_met: data.deadline_met ?? null,
            averagetime: data.averagetime ?? null,
        },
    });
}

export async function getEmployeesByOrg(orgId: number) {
    return await prisma.employees.findMany({
        where: { orgid: orgId },
        orderBy: { emp_id: 'asc' },
    });
}
