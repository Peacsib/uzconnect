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

  // 5. Seed Coordinator
  const coordPwHash = await bcrypt.hash("Bethel0112#2004", 10)

  const coordinatorUser = await prisma.user.upsert({
    where: { email: "peacesibx@gmail.com" },
    update: {
      name: "Jameson Sibanda",
      passwordHash: coordPwHash,
      role: "COORDINATOR",
    },
    create: {
      email: "peacesibx@gmail.com",
      name: "Jameson Sibanda",
      passwordHash: coordPwHash,
      role: "COORDINATOR",
    },
  })

  console.log("Seeding complete! Database is populated with academic catalogue, companies, and Coordinator Jameson Sibanda.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
