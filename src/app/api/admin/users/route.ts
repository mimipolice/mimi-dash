import { NextResponse } from "next/server";
import { UserInfo } from "@/components/admin-user-card";

// Mock user data
const users: UserInfo[] = [
  {
    id: "1",
    name: "Amamiya",
    image: "/images/amamiya.jpg",
    balance: 10000,
    serverCount: 5,
  },
  {
    id: "2",
    name: "Yuki",
    image: null,
    balance: 500,
    serverCount: 1,
  },
  {
    id: "3",
    name: "Mimi",
    image: null,
    balance: 120000,
    serverCount: 10,
  },
  {
    id: "4",
    name: "Mimi",
    image: null,
    balance: 120000,
    serverCount: 10,
  },
  {
    id: "5",
    name: "Mimi",
    image: null,
    balance: 120000,
    serverCount: 10,
  },
];

export async function GET() {
  // In a real application, you would fetch this data from your database
  return NextResponse.json(users);
}
