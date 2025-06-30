// To run this script: npx tsx scripts/seed.ts (ensure tsx is installed: npm i -D tsx)
// Or configure a script in package.json: "seed": "tsx scripts/seed.ts" then "npm run seed"
import mongoose from "mongoose"
import Player from "../models/player-model" // Adjust path as needed
import Config from "../models/config-model" // Adjust path

const MONGODB_URI = process.env.MONGODB_URI!

async function seedDatabase() {
  console.log("Connecting to MongoDB...")
  await mongoose.connect(MONGODB_URI)
  console.log("Connected to MongoDB.")

  try {
    console.log("Starting seeding process...")

    // Seed Default Config if it doesn't exist
    console.log("Checking for existing config...")
    let config = await Config.findOne()
    if (!config) {
      console.log("No config found, creating default config...")
      config = await Config.create({
        chavePix: "71992802951",
        valorMensalidade: 50.0,
        nomeAssociacao: "Associação de Futebol de Porto dos Santos",
        cidadeAssociacao: "PORTO DOS SANTOS",
        dataAtualizacao: new Date(),
      })
      console.log("Default config created:", config)
    } else {
      console.log("Config already exists:", config)
    }

    // Seed Mock User for Testing (CPF: 123.456.789-01)
    const mockUserCpf = "12345678901" // No dots/hyphens
    console.log(`Checking for mock user with CPF: ${mockUserCpf}...`)
    let mockUser = await Player.findOne({ cpf: mockUserCpf })

    if (!mockUser) {
      console.log("Mock user not found. Creating mock user...")
      mockUser = await Player.create({
        cpf: mockUserCpf,
        nome: "Mock User Teste",
        apelido: "Mock",
        role: "jogador", // Or 'admin' for admin testing
        status: "ativo",
        isAuthorized: true, // Pre-authorize for testing
        registrationCompleted: true, // Assume completed for easy login test
        email: "mockuser@afps.dev",
        nascimento: new Date("1990-01-01"),
        telefone: "71999999999",
        posicao: "Atacante",
        numero: 10,
      })
      console.log("Mock user created:", mockUser)
    } else {
      console.log("Mock user already exists:", mockUser)
      // Optionally update if needed
      // mockUser.isAuthorized = true;
      // mockUser.registrationCompleted = true;
      // await mockUser.save();
      // console.log("Mock user updated.");
    }

    // Seed an authorized but not registered CPF for registration flow testing
    const authorizedCpfForRegistration = "98765432100"
    console.log(`Checking for authorized CPF for registration: ${authorizedCpfForRegistration}...`)
    let authUserForReg = await Player.findOne({ cpf: authorizedCpfForRegistration })
    if (!authUserForReg) {
      console.log("Authorized CPF for registration not found. Creating...")
      authUserForReg = await Player.create({
        cpf: authorizedCpfForRegistration,
        nome: "Pendente Cadastro", // Default name
        role: null,
        status: "autorizado_nao_cadastrado",
        isAuthorized: true, // Key for registration flow
        registrationCompleted: false,
      })
      console.log("Authorized CPF for registration created:", authUserForReg)
    } else {
      console.log("Authorized CPF for registration already exists:", authUserForReg)
      if (!authUserForReg.isAuthorized || authUserForReg.registrationCompleted) {
        authUserForReg.isAuthorized = true
        authUserForReg.registrationCompleted = false
        authUserForReg.status = "autorizado_nao_cadastrado"
        authUserForReg.role = null
        authUserForReg.nome = "Pendente Cadastro"
        await authUserForReg.save()
        console.log("Authorized CPF for registration updated for testing.")
      }
    }

    console.log("Seeding process completed successfully.")
  } catch (error) {
    console.error("Error during seeding process:", error)
  } finally {
    console.log("Closing MongoDB connection.")
    await mongoose.connection.close()
    console.log("MongoDB connection closed.")
  }
}

seedDatabase().catch((err) => {
  console.error("Unhandled error in seed script:", err)
  process.exit(1)
})
