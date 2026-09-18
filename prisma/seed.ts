import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  // Faculties
  const scienceFaculty = await prisma.faculty.upsert({
    where: { name: "Faculty of Science and Technology" },
    update: {},
    create: { name: "Faculty of Science and Technology" },
  })
  const commerceFaculty = await prisma.faculty.upsert({
    where: { name: "Faculty of Commerce" },
    update: {},
    create: { name: "Faculty of Commerce" },
  })

  // Departments
  const csDept = await prisma.department.upsert({
    where: { name_facultyId: { name: "Department of Computer Science", facultyId: scienceFaculty.id } },
    update: {},
    create: { name: "Department of Computer Science", facultyId: scienceFaculty.id },
  })
  const isDept = await prisma.department.upsert({
    where: { name_facultyId: { name: "Department of Information Systems", facultyId: scienceFaculty.id } },
    update: {},
    create: { name: "Department of Information Systems", facultyId: scienceFaculty.id },
  })
  const seDept = await prisma.department.upsert({
    where: { name_facultyId: { name: "Department of Software Engineering", facultyId: scienceFaculty.id } },
    update: {},
    create: { name: "Department of Software Engineering", facultyId: scienceFaculty.id },
  })
  const accDept = await prisma.department.upsert({
    where: { name_facultyId: { name: "Department of Accounting", facultyId: commerceFaculty.id } },
    update: {},
    create: { name: "Department of Accounting", facultyId: commerceFaculty.id },
  })

  // Programmes
  const bscCs = await prisma.programme.upsert({
    where: { code: "BSCCS" },
    update: {},
    create: { code: "BSCCS", name: "BSc Computer Science", duration: 4, departmentId: csDept.id },
  })
  const bscIs = await prisma.programme.upsert({
    where: { code: "BSCIS" },
    update: {},
    create: { code: "BSCIS", name: "BSc Information Systems", duration: 4, departmentId: isDept.id },
  })
  const bscSe = await prisma.programme.upsert({
    where: { code: "BSCSE" },
    update: {},
    create: { code: "BSCSE", name: "BSc Software Engineering", duration: 4, departmentId: seDept.id },
  })

  // Companies
  const econet = await prisma.company.upsert({
    where: { id: "company-econet" },
    update: {},
    create: { id: "company-econet", name: "Econet Wireless", address: "1906 Borrowdale Rd", city: "Harare", email: "hr@econet.co.zw" },
  })
  const telone = await prisma.company.upsert({
    where: { id: "company-telone" },
    update: {},
    create: { id: "company-telone", name: "TelOne", address: "107 Kwame Nkrumah Ave", city: "Harare", email: "hr@telone.co.zw" },
  })

  const hash = async (pw: string) => bcrypt.hash(pw, 12)

  // Coordinator
  await prisma.user.upsert({
    where: { email: "coordinator@uz.ac.zw" },
    update: {},
    create: {
      email: "coordinator@uz.ac.zw",
      name: "Ms. Tsitsi Nhira",
      passwordHash: await hash("coord123!"),
      role: "COORDINATOR",
    },
  })

  // Lecturer
  const lecturerUser = await prisma.user.upsert({
    where: { email: "f.makudza@uz.ac.zw" },
    update: {},
    create: {
      email: "f.makudza@uz.ac.zw",
      name: "F. Makudza",
      passwordHash: await hash("lecturer123!"),
      role: "LECTURER",
      lecturer: { create: { departmentId: csDept.id } },
    },
  })

  // Supervisor
  const supervisorUser = await prisma.user.upsert({
    where: { email: "t.moyo@econet.co.zw" },
    update: {},
    create: {
      email: "t.moyo@econet.co.zw",
      name: "Tendai Moyo",
      passwordHash: await hash("super123!"),
      role: "SUPERVISOR",
      supervisor: { create: { companyId: econet.id, position: "Senior Engineer", approved: true } },
    },
  })

  // Student (from CSV: R2421428,Sibanda,Peace,BSCCS)
  const studentUser = await prisma.user.upsert({
    where: { email: "R2421428@uofzmail.uz.ac.zw" },
    update: {},
    create: {
      email: "R2421428@uofzmail.uz.ac.zw",
      name: "Peace Sibanda",
      passwordHash: await hash("student123!"),
      role: "STUDENT",
      regNumber: "R2421428",
      student: {
        create: {
          regNumber: "R2421428",
          programmeId: bscCs.id,
          phone: "+263715582943",
        },
      },
    },
  })

  console.log("✅ Seed complete!")
  console.log("")
  console.log("Demo accounts:")
  console.log("  Coordinator: coordinator@uz.ac.zw / coord123!")
  console.log("  Lecturer:    f.makudza@uz.ac.zw   / lecturer123!")
  console.log("  Supervisor:  t.moyo@econet.co.zw  / super123!")
  console.log("  Student:     R2421428@uofzmail.uz.ac.zw / student123!")
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })