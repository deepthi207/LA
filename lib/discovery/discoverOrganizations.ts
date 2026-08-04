import { discoverCalNonprofits } from "./calNonprofits";
import { discoverVolunteerMatch } from "./volunteerMatch";
import { discoverCARegistry } from "./caRegistry";

export async function discoverOrganizations() {
  const cal = await discoverCalNonprofits();
  const volunteer = await discoverVolunteerMatch();
  const registry = await discoverCARegistry();

  return [...cal, ...volunteer, ...registry];
}