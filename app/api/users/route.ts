import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";


export async function POST(req:NextRequest) {
    const user = await currentUser();
    
    // if user already exists ?
    const userResult = await db.select().from(usersTable)
    //@ts-ignore
    .where(eq(usersTable.email, user?.primaryEmailAddress?.emailAddress))
    

    // if new user then insert 
    if(userResult?.length==0)
    {
        const data = {
            name:user?.fullName ?? 'NA',
            email:user?.primaryEmailAddress?.emailAddress ?? '',
            credis:3
        }
        const result = await db.insert(usersTable).values({
            ...data
        })
        return NextResponse.json(data);
    }
   
    return NextResponse.json({user:userResult[0]});
}