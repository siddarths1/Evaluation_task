/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { EmployeeFilterInput } from './dto/employee.input.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmployeeResponse } from './dto/employee.response.dto';
import { Prisma } from '@prisma/client';
import { PositionResponse } from './dto/position.output.dto';

@Injectable()
export class EmployeeService {
  constructor(private prisma: PrismaService) {}

  async getEmployees(
    filter: EmployeeFilterInput,
    skip: number,
    take: number,
  ): Promise<EmployeeResponse> {
    const query = Prisma.sql`
    WITH filtered_employees AS (
      SELECT 
        "employeeId"::text,
        "Name",
        "FirstName",
        "LastName",
        "Position",
        "Status",
        "createdAt",
        "updatedAt",
        "createdBy",
        "updatedBy"
      FROM "default$default"."Employee"
      WHERE 
        (${filter.Name}::text IS NULL OR "Name" ILIKE '%' || ${filter.Name}::text || '%')
        AND (${filter.FirstName}::text IS NULL OR "FirstName" ILIKE '%' || ${filter.FirstName}::text || '%')
        AND (${filter.LastName}::text IS NULL OR "LastName" ILIKE '%' || ${filter.LastName}::text || '%')
        AND (${filter.Position}::text IS NULL OR "Position" ILIKE '%' || ${filter.Position}::text || '%')
        AND (${filter.Status}::boolean IS NULL OR "Status" = ${filter.Status}::boolean)
    ), ranked_employees AS (
      SELECT *,
             ROW_NUMBER() OVER (ORDER BY "employeeId" ASC) AS row_num
      FROM filtered_employees
    )
    SELECT 
      (SELECT COUNT(*) FROM filtered_employees) AS total_count, 
      "employeeId",
      "Name",
      "FirstName",
      "LastName",
      "Position",
      "Status",
      TO_CHAR(("createdAt" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata'), 'YYYY-MM-DD HH24:MI:SS') AS "createdAt", 
      TO_CHAR(("updatedAt" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata'), 'YYYY-MM-DD HH24:MI:SS') AS "updatedAt", 
      "createdBy",
      "updatedBy"
    FROM ranked_employees
    WHERE row_num > ${skip}
    LIMIT ${take};
  `;
    // Execute raw query and get the results
    const employees = await this.prisma.$queryRaw<any[]>(query);

    const total_count = Number(employees[0]?.total_count) || 0;

    // Map the employees array (excluding the total_count from individual employee records)
    const employeeList = employees.map((e) => ({
      employeeId: e.employeeId,
      Name: e.Name,
      FirstName: e.FirstName,
      LastName: e.LastName,
      Position: e.Position,
      Status: e.Status,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    }));

    return {
      total_count,
      employees: employeeList,
    };
  }

  async getPositions(): Promise<PositionResponse[]> {
    const query = Prisma.sql`
   SELECT 
  DISTINCT "Position", 
  "Status"
FROM 
  "default$default"."Employee"
WHERE 
  "Position" IS NOT NULL 
  AND "Position" != ''
ORDER BY 
  "Position" ASC, "Status" DESC;
    `;

    // Execute raw query and get the results
    const positions = await this.prisma.$queryRaw<PositionResponse[]>(query);
    console.log('🚀 ~ EmployeeService ~ getPositions ~ positions:', positions);
    return positions;
  }
}
