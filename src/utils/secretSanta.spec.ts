import { SecretSantaGame } from './secretSanta';
import { Employee, SecretSantaAssignment } from '../types';

describe('SecretSantaGame', () => {
  const employees: Employee[] = [
    { Employee_Name: 'John Doe', Employee_EmailID: 'john@acme.com' },
    { Employee_Name: 'Jane Smith', Employee_EmailID: 'jane@acme.com' },
    { Employee_Name: 'Bob Wilson', Employee_EmailID: 'bob@acme.com' },
    { Employee_Name: 'Alice Johnson', Employee_EmailID: 'alice@acme.com' },
    { Employee_Name: 'Charlie Brown', Employee_EmailID: 'charlie@acme.com' },
    { Employee_Name: 'David Lee', Employee_EmailID: 'david@acme.com' },
    { Employee_Name: 'Emily Clark', Employee_EmailID: 'emily@acme.com' },
    { Employee_Name: 'Frank Martin', Employee_EmailID: 'frank@acme.com' },
    { Employee_Name: 'Grace Hall', Employee_EmailID: 'grace@acme.com' },
    { Employee_Name: 'Henry Adams', Employee_EmailID: 'henry@acme.com' },
  ];

  const previousAssignments: SecretSantaAssignment[] = [
    {
      Employee_Name: 'John Doe',
      Employee_EmailID: 'john@acme.com',
      Secret_Child_Name: 'Jane Smith',
      Secret_Child_EmailID: 'jane@acme.com',
    },
    {
      Employee_Name: 'Jane Smith',
      Employee_EmailID: 'jane@acme.com',
      Secret_Child_Name: 'Bob Wilson',
      Secret_Child_EmailID: 'bob@acme.com',
    },
    {
      Employee_Name: 'Bob Wilson',
      Employee_EmailID: 'bob@acme.com',
      Secret_Child_Name: 'Alice Johnson',
      Secret_Child_EmailID: 'alice@acme.com',
    },
    {
      Employee_Name: 'Alice Johnson',
      Employee_EmailID: 'alice@acme.com',
      Secret_Child_Name: 'Charlie Brown',
      Secret_Child_EmailID: 'charlie@acme.com',
    },
    {
      Employee_Name: 'Charlie Brown',
      Employee_EmailID: 'charlie@acme.com',
      Secret_Child_Name: 'David Lee',
      Secret_Child_EmailID: 'david@acme.com',
    },
    {
      Employee_Name: 'David Lee',
      Employee_EmailID: 'david@acme.com',
      Secret_Child_Name: 'Emily Clark',
      Secret_Child_EmailID: 'emily@acme.com',
    },
    {
      Employee_Name: 'Emily Clark',
      Employee_EmailID: 'emily@acme.com',
      Secret_Child_Name: 'Frank Martin',
      Secret_Child_EmailID: 'frank@acme.com',
    },
    {
      Employee_Name: 'Frank Martin',
      Employee_EmailID: 'frank@acme.com',
      Secret_Child_Name: 'Grace Hall',
      Secret_Child_EmailID: 'grace@acme.com',
    },
    {
      Employee_Name: 'Grace Hall',
      Employee_EmailID: 'grace@acme.com',
      Secret_Child_Name: 'Henry Adams',
      Secret_Child_EmailID: 'henry@acme.com',
    },
    {
      Employee_Name: 'Henry Adams',
      Employee_EmailID: 'henry@acme.com',
      Secret_Child_Name: 'John Doe',
      Secret_Child_EmailID: 'john@acme.com',
    },
  ];

  it('should generate valid assignments', () => {
    const game = new SecretSantaGame(employees);
    const assignments = game.generateAssignments();

    expect(assignments).toHaveLength(employees.length);

    // Check that each employee is assigned exactly once as a santa
    const santas = new Set(assignments.map((a) => a.Employee_EmailID));
    expect(santas.size).toBe(employees.length);

    // Check that each employee is assigned exactly once as a child
    const children = new Set(assignments.map((a) => a.Secret_Child_EmailID));
    expect(children.size).toBe(employees.length);

    // Check that no one is their own secret santa
    assignments.forEach((assignment) => {
      expect(assignment.Employee_EmailID).not.toBe(assignment.Secret_Child_EmailID);
    });
  });

  it('should respect previous year assignments', () => {
    const game = new SecretSantaGame(employees, previousAssignments);
    const assignments = game.generateAssignments();

    // Check that no assignment matches previous year
    assignments.forEach((assignment) => {
      const previousAssignment = previousAssignments.find(
        (prev) => prev.Employee_EmailID === assignment.Employee_EmailID
      );

      if (previousAssignment) {
        expect(assignment.Secret_Child_EmailID).not.toBe(previousAssignment.Secret_Child_EmailID);
      }
    });
  });
});
