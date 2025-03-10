import { clsx, type ClassValue } from "clsx"
import { toast } from "sonner"
import { twMerge } from "tailwind-merge"
import { ApiError } from "./api/base"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function displayApiError(toastMessage: string, error: ApiError) {
  toast.error(`${toastMessage}: ${error.message}`)
  console.error(error)
}