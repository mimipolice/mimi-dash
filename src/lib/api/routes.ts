import { handleApiResponse } from "../apiHelper";

type SelectOption = {
  label: string;
  value: string;
};

export async function fetchImageOptions(): Promise<SelectOption[]> {
  const response = await fetch("/api/images");
  return (await handleApiResponse(response)) ?? [];
}

export async function fetchRouteOptions(): Promise<SelectOption[]> {
  const response = await fetch("/api/routes");
  return (await handleApiResponse(response)) ?? [];
}
