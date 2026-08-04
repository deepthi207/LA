import { findCareersPage } from "../discovery/findCareers";
import { detectATS } from "../discovery/detectATS";
import { scrapeCustomJobs } from "../scrapers/customScraper";

export async function processOrganization(org: any) {

    if (!org.website) {
        return {
            organization: org.name,
            success: false,
            reason: "No website"
        };
    }

    const careers = await findCareersPage(org.website);

    if (!careers) {

        return {
            organization: org.name,
            success: false,
            reason: "No careers page"
        };

    }

    const ats = await detectATS(careers);

    let jobs: any[] = [];

    switch (ats.ats) {

        case "Custom":
            jobs = await scrapeCustomJobs(careers);
            break;

        default:
            jobs = [];

    }

    return {

        organization: org.name,

        website: org.website,

        careers,

        ats: ats.ats,

        jobs

    };

}