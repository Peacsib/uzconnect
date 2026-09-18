import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import fs from "fs"
import path from "path"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database with full academic catalogue from official curriculum...")

  // 1. Seed Faculties
  const facultiesData = JSON.parse(fs.readFileSync(path.join(process.cwd(), "src/data/faculties.json"), "utf8"))
  for (const f of facultiesData) {
    await prisma.faculty.upsert({
      where: { id: f.id },
      update: { name: f.name },
      create: { id: f.id, name: f.name },
    })
  }
  console.log(`Seeded ${facultiesData.length} faculties.`)

  // 2. Seed Departments
  const departmentsData = JSON.parse(fs.readFileSync(path.join(process.cwd(), "src/data/departments.json"), "utf8"))
  for (const d of departmentsData) {
    await prisma.department.upsert({
      where: { id: d.id },
      update: { name: d.name, facultyId: d.faculty_id },
      create: { id: d.id, name: d.name, facultyId: d.faculty_id },
    })
  }
  console.log(`Seeded ${departmentsData.length} departments.`)

  // 3. Seed Programmes (all 174 official degrees with codes)
  const programmesData = JSON.parse(fs.readFileSync(path.join(process.cwd(), "src/data/programmes.json"), "utf8"))
  for (const p of programmesData) {
    await prisma.programme.upsert({
      where: { code: p.code },
      update: { name: p.name, departmentId: p.department_id, duration: 4 },
      create: {
        id: p.id,
        code: p.code,
        name: p.name,
        departmentId: p.department_id,
        duration: 4,
      },
    })
  }
  console.log(`Seeded ${programmesData.length} programmes.`)

  // 4. Seed Companies
  const econet = await prisma.company.upsert({
    where: { id: "comp_econet" },
    update: {},
    create: {
      id: "comp_econet",
      name: "Econet Wireless Zimbabwe",
      email: "internships@econet.co.zw",
      phone: "+263 242 486104",
      address: "2 Old Mutare Road, Msasa",
      city: "Harare",
    },
  })

  const delta = await prisma.company.upsert({
    where: { id: "comp_delta" },
    update: {},
    create: {
      id: "comp_delta",
      name: "Delta Beverages",
      email: "hr@delta.co.zw",
      phone: "+263 242 750661",
      address: "Sable House, Northridge Park",
      city: "Harare",
    },
  })

  // 5. Seed Demo Users
  const passwordHash = await bcrypt.hash("takeMyWill0112#2004", 10)
  const defaultPwHash = await bcrypt.hash("password123", 10)

  // Student 1
  const studentUser = await prisma.user.upsert({
    where: { email: "student@uz.ac.zw" },
    update: {},
    create: {
      email: "student@uz.ac.zw",
      name: "Tatenda Chidziwa",
      passwordHash,
      role: "STUDENT",
      regNumber: "R214567A",
      student: {
        create: {
          regNumber: "R214567A",
          programmeId: 166, // Computer Science / AI / Informatics
          phone: "+263 77 123 4567",
        },
      },
    },
  })

  // Supervisor 1
  const supervisorUser = await prisma.user.upsert({
    where: { email: "supervisor@econet.co.zw" },
    update: {},
    create: {
      email: "supervisor@econet.co.zw",
      name: "Eng. Farai Mutasa",
      passwordHash,
      role: "SUPERVISOR",
      supervisor: {
        create: {
          companyId: econet.id,
          position: "Lead Software Architect",
          approved: true,
        },
      },
    },
  })

  // Lecturer 1
  const lecturerUser = await prisma.user.upsert({
    where: { email: "lecturer@science.uz.ac.zw" },
    update: {},
    create: {
      email: "lecturer@science.uz.ac.zw",
      name: "Dr. K. Nyambo",
      passwordHash,
      role: "LECTURER",
      lecturer: {
        create: {
          departmentId: 140,
        },
      },
    },
  })

  // Coordinator 1
  const coordinatorUser = await prisma.user.upsert({
    where: { email: "coordinator@science.uz.ac.zw" },
    update: {},
    create: {
      email: "coordinator@science.uz.ac.zw",
      name: "Prof. H. Ndlovu",
      passwordHash,
      role: "COORDINATOR",
    },
  })

  console.log("Seeding complete! Database is now populated with full academic catalogue and demo accounts.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
