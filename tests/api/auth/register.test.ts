import { POST } from "@/app/api/auth/register/route";
import { prisma } from "@/lib/prisma";
import { hashPassword, generateToken } from "@/lib/auth";
import { mockDeep, mockReset } from "jest-mock-extended";
import { NextRequest } from "next/server";

// Mock dependencies
jest.mock("@/lib/prisma", () => {
  const { mockDeep } = require("jest-mock-extended");
  return {
    __esModule: true,
    prisma: mockDeep(),
  };
});

jest.mock("@/lib/auth", () => ({
  hashPassword: jest.fn(),
  generateToken: jest.fn(),
  setAuthCookie: jest.fn(),
}));

const mockPrisma = prisma as unknown as ReturnType<typeof mockDeep>;
const mockHashPassword = hashPassword as jest.Mock;
const mockGenerateToken = generateToken as jest.Mock;

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    mockReset(mockPrisma);
    mockHashPassword.mockReset();
    mockGenerateToken.mockReset();
  });

  it("should register a new candidate successfully", async () => {
    // Setup
    const body = {
      email: "test@example.com",
      password: "password123",
      name: "Test User",
      role: "CANDIDATE",
      phone: "1234567890",
    };
    const req = new NextRequest("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    });

    // Mocks
    mockPrisma.user.findUnique.mockResolvedValue(null); // User does not exist
    mockHashPassword.mockResolvedValue("hashed_password");
    mockPrisma.user.create.mockResolvedValue({
      id: "user_123",
      email: body.email,
      name: body.name,
      role: body.role,
      password: "hashed_password",
      phone: body.phone,
      isActive: true,
      isVerified: false,
      verificationToken: null,
      resetToken: null,
      resetTokenExpiry: null,
      lastLogin: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);
    mockPrisma.candidate.create.mockResolvedValue({} as any);
    mockGenerateToken.mockReturnValue("mock_token");

    // Execute
    const response = await POST(req);
    const json = await response.json();

    // Verify
    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.user).toEqual({
      id: "user_123",
      email: body.email,
      name: body.name,
      role: body.role,
    });
    expect(mockPrisma.user.create).toHaveBeenCalled();
    expect(mockPrisma.candidate.create).toHaveBeenCalled();
  });

  it("should return 400 if user already exists", async () => {
    // Setup
    const body = {
      email: "existing@example.com",
      password: "password123",
      name: "Existing User",
      role: "CANDIDATE",
    };
    const req = new NextRequest("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    });

    // Mocks
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "existing_id",
      email: body.email,
    } as any);

    // Execute
    const response = await POST(req);
    const json = await response.json();

    // Verify
    expect(response.status).toBe(400);
    expect(json.error).toBe("User with this email already exists");
    expect(mockPrisma.user.create).not.toHaveBeenCalled();
  });

  it("should return 400 for validation errors", async () => {
    // Setup - Invalid email and short password
    const body = {
      email: "not-an-email",
      password: "short",
      name: "U",
      role: "INVALID_ROLE",
    };
    const req = new NextRequest("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    });

    // Execute
    const response = await POST(req);
    const json = await response.json();

    // Verify
    expect(response.status).toBe(400);
    expect(json.error).toBe("Validation error");
    expect(json.details).toBeDefined();
    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
  });
});
