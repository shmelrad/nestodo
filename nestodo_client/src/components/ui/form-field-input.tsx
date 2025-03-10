import { FormField, FormItem, FormLabel, FormMessage, FormControl } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { UseFormReturn, FieldValues, Path } from "react-hook-form"

interface FormFieldInputProps<T extends FieldValues> {
  form: UseFormReturn<T>
  name: Path<T>
  label: string
  type: string
  placeholder: string
  disabled?: boolean
}

export function FormFieldInput<T extends FieldValues>({
  form,
  name,
  label,
  type,
  placeholder,
  disabled
}: FormFieldInputProps<T>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}