import { InternalServerErrorException } from '@nestjs/common';
import { Employee, SecretSantaAssignment } from '../types';
import { HopcroftKarp } from './HopcroftKarp';

export class SecretSantaGame {
  private employees: Employee[];
  private previousAssignments: SecretSantaAssignment[];

  constructor(employees: Employee[], previousAssignments: SecretSantaAssignment[] = []) {
    this.employees = employees;
    this.previousAssignments = previousAssignments;
  }

  private chunkifyEmployees(): Employee[][] {
    return this.employees.reduce((acc: Employee[][], curr: Employee, index: number) => {
      const chunkIdx = Math.floor((index + 1) / 100);
      acc[chunkIdx] ??= [];
      acc[chunkIdx].push(curr);
      return acc;
    }, []);
  }

  public generateAssignments(): SecretSantaAssignment[] {
    const chunkifiedEmployees = this.chunkifyEmployees();
    const assignments: SecretSantaAssignment[] = [];

    let count = 0;
    for (const employees of chunkifiedEmployees) {
      const employeeMap = {};
      const exclusionRecord: Record<string, string[]> = {};
      for (const employeeData of employees) {
        employeeMap[employeeData.Employee_EmailID] = employeeData.Employee_Name;
        const exclusionList = [employeeData.Employee_EmailID];
        const prevYearAssignment = this.previousAssignments.find(
          (emp) => emp.Employee_EmailID === employeeData.Employee_EmailID
        );
        if (prevYearAssignment !== undefined) {
          exclusionList.push(prevYearAssignment.Secret_Child_EmailID);
        }
        exclusionRecord[employeeData.Employee_EmailID] = exclusionList;
      }
      const employeeEmails = Object.keys(employeeMap);
      const maxMatchAlgo = new HopcroftKarp(employeeEmails, [...employeeEmails], exclusionRecord);
      const { match } = maxMatchAlgo.findMaximumMatches();

      for (const key in match) {
        if (match[key] === null) {
          chunkifiedEmployees[count + 1].push({ Employee_EmailID: key, Employee_Name: employeeMap[key] });
        } else {
          assignments.push({
            Employee_EmailID: key,
            Employee_Name: employeeMap[key],
            Secret_Child_EmailID: match[key],
            Secret_Child_Name: employeeMap[match[key]],
          });
        }
      }
      count++;
    }
    if (assignments.length < this.employees.length) {
      throw new InternalServerErrorException('Failed to assign secret santa to all employees');
    }
    return assignments;
  }
}
