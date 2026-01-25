import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // Create default platform admin
  const adminEmail = "admin@nexus.local"
  const adminPassword = "xx123654"

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (!existingAdmin) {
    const passwordHash = await hash(adminPassword, 12)
    
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Platform Admin",
        passwordHash,
        isPlatformAdmin: true,
        emailVerified: new Date(),
      },
    })

    console.log(`✅ Created platform admin: ${admin.email}`)
  } else {
    console.log(`⏭️  Platform admin already exists: ${existingAdmin.email}`)
  }

  // Create a demo tenant with group and company
  const demoTenantCode = "demo"
  const existingTenant = await prisma.tenant.findUnique({
    where: { code: demoTenantCode },
  })

  if (!existingTenant) {
    const tenant = await prisma.tenant.create({
      data: {
        name: "演示企业集团",
        code: demoTenantCode,
        plan: "TRIAL",
        status: "ACTIVE",
        maxUsers: 100,
        group: {
          create: {
            name: "演示集团",
            companies: {
              create: [
                {
                  tenantId: "", // Will be set by relation
                  name: "演示公司A",
                  code: "company-a",
                  status: "ACTIVE",
                  departments: {
                    create: {
                      tenantId: "",
                      name: "总经办",
                      teams: {
                        create: {
                          tenantId: "",
                          companyId: "",
                          name: "管理组",
                        },
                      },
                    },
                  },
                },
              ],
            },
          },
        },
      },
      include: {
        group: {
          include: {
            companies: {
              include: {
                departments: {
                  include: {
                    teams: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    // Update tenantId for nested records
    const company = tenant.group?.companies[0]
    const department = company?.departments[0]
    const team = department?.teams[0]

    if (company) {
      await prisma.company.update({
        where: { id: company.id },
        data: { tenantId: tenant.id },
      })
    }

    if (department) {
      await prisma.department.update({
        where: { id: department.id },
        data: { tenantId: tenant.id },
      })
    }

    if (team) {
      await prisma.team.update({
        where: { id: team.id },
        data: { tenantId: tenant.id, companyId: company?.id },
      })
    }

    console.log(`✅ Created demo tenant: ${tenant.name}`)

    // Create a demo tenant admin user
    const tenantAdminEmail = "tenant@demo.local"
    const tenantAdminPassword = "xx123654"
    const tenantAdminHash = await hash(tenantAdminPassword, 12)

    const tenantAdmin = await prisma.user.create({
      data: {
        email: tenantAdminEmail,
        name: "集团管理员",
        passwordHash: tenantAdminHash,
        tenantId: tenant.id,
        isPlatformAdmin: false,
        emailVerified: new Date(),
      },
    })

    // Create employee record for tenant admin
    if (team) {
      await prisma.employee.create({
        data: {
          tenantId: tenant.id,
          companyId: company!.id,
          userId: tenantAdmin.id,
          teamId: team.id,
          employeeNo: "EMP001",
          position: "集团管理员",
          status: "ACTIVE",
          joinDate: new Date(),
        },
      })
    }

    console.log(`✅ Created tenant admin: ${tenantAdminEmail}`)
  } else {
    console.log(`⏭️  Demo tenant already exists: ${existingTenant.name}`)
  }

  console.log("🎉 Seeding completed!")
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
