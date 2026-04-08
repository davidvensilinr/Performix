import { prisma } from '../prisma';

export type EmployeeData = {
    emp_name: string;
    orgId: number;
    // basic
    tasks?: number | null;
    deadline_met?: number | null;
    averagetime?: number | null;
    // ml metrics
    performance_score?: number | null;
    attendance_percent?: number | null;
    late_days?: number | null;
    projects_completed?: number | null;
    complaints?: number | null;
    skills_score?: number | null;
    experience_years?: number | null;
    leadership_score?: number | null;
    workload?: number | null;
    deadline_pressure?: number | null;
    job_satisfaction?: number | null;
    past_overtime?: boolean | null;
};

export type EmployeeUpdateData = Omit<Partial<EmployeeData>, 'orgId'>;

export async function addEmployee(data: EmployeeData) {
    return await prisma.employees.create({
        data: {
            emp_name: data.emp_name,
            orgid: data.orgId,
            tasks: data.tasks ?? null,
            deadline_met: data.deadline_met ?? null,
            averagetime: data.averagetime ?? null,
            performance_score: data.performance_score ?? null,
            attendance_percent: data.attendance_percent ?? null,
            late_days: data.late_days ?? null,
            projects_completed: data.projects_completed ?? null,
            complaints: data.complaints ?? null,
            skills_score: data.skills_score ?? null,
            experience_years: data.experience_years ?? null,
            leadership_score: data.leadership_score ?? null,
            workload: data.workload ?? null,
            deadline_pressure: data.deadline_pressure ?? null,
            job_satisfaction: data.job_satisfaction ?? null,
            past_overtime: data.past_overtime ?? null,
        },
    });
}

export async function updateEmployee(empId: number, data: EmployeeUpdateData) {
    return await prisma.employees.update({
        where: { emp_id: empId },
        data: {
            ...(data.emp_name !== undefined && { emp_name: data.emp_name }),
            ...(data.tasks !== undefined && { tasks: data.tasks }),
            ...(data.deadline_met !== undefined && { deadline_met: data.deadline_met }),
            ...(data.averagetime !== undefined && { averagetime: data.averagetime }),
            ...(data.performance_score !== undefined && { performance_score: data.performance_score }),
            ...(data.attendance_percent !== undefined && { attendance_percent: data.attendance_percent }),
            ...(data.late_days !== undefined && { late_days: data.late_days }),
            ...(data.projects_completed !== undefined && { projects_completed: data.projects_completed }),
            ...(data.complaints !== undefined && { complaints: data.complaints }),
            ...(data.skills_score !== undefined && { skills_score: data.skills_score }),
            ...(data.experience_years !== undefined && { experience_years: data.experience_years }),
            ...(data.leadership_score !== undefined && { leadership_score: data.leadership_score }),
            ...(data.workload !== undefined && { workload: data.workload }),
            ...(data.deadline_pressure !== undefined && { deadline_pressure: data.deadline_pressure }),
            ...(data.job_satisfaction !== undefined && { job_satisfaction: data.job_satisfaction }),
            ...(data.past_overtime !== undefined && { past_overtime: data.past_overtime }),
        },
    });
}

export async function getEmployeesByOrg(orgId: number) {
    return await prisma.employees.findMany({
        where: { orgid: orgId },
        orderBy: { emp_id: 'asc' },
    });
}
