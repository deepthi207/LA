import { NextResponse } from "next/server";
import { processOrganization } from "@/lib/pipeline/processOrganization";

export async function GET() {

    const organization = {

        name: "NGO-ISAC",

        website: "https://www.ngoisac.org"

    };

    const result = await processOrganization(
        organization
    );

    return NextResponse.json(result);

}