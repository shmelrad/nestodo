import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"

const timeEstimationSchema = z.object({
  hours: z.string().optional().refine(val => !val || /^\d*$/.test(val), {
    message: "Hours must be a number"
  }),
  minutes: z.string().optional().refine(val => !val || /^\d*$/.test(val), {
    message: "Minutes must be a number"
  })
});

type TimeEstimationFormValues = z.infer<typeof timeEstimationSchema>;

interface TimeEstimationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialHours: number
  initialMinutes: number
  onSave: (minutes: number | null) => void
}

export function TimeEstimationDialog({
  open,
  onOpenChange,
  initialHours,
  initialMinutes,
  onSave,
}: TimeEstimationDialogProps) {
  const form = useForm<TimeEstimationFormValues>({
    resolver: zodResolver(timeEstimationSchema),
    defaultValues: {
      hours: initialHours ? String(initialHours) : "",
      minutes: initialMinutes ? String(initialMinutes) : "",
    },
  });

  function onSubmit(data: TimeEstimationFormValues) {
    const hours = data.hours ? parseInt(data.hours) : 0;
    const minutes = data.minutes ? parseInt(data.minutes) : 0;
    
    if ((data.hours === "" && data.minutes === "") || (hours === 0 && minutes === 0)) {
      onSave(null);
    } else {
      const totalMinutes = (hours * 60) + minutes;
      onSave(totalMinutes);
    }
    
    onOpenChange(false);
  }

  const handleClear = () => {
    onSave(null);
    onOpenChange(false);
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => {
    const value = e.target.value;
    if (value === "" || /^\d*$/.test(value)) {
      onChange(value);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Time Estimate</DialogTitle>
          <DialogDescription>
            Estimate how long this task will take to complete
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="hours"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="hours">Hours</Label>
                    <FormControl>
                      <Input
                        id="hours"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="0"
                        {...field}
                        onChange={(e) => handleInputChange(e, field.onChange)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minutes"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="minutes">Minutes</Label>
                    <FormControl>
                      <Input
                        id="minutes"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="0"
                        {...field}
                        onChange={(e) => handleInputChange(e, field.onChange)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" type="button" onClick={handleClear}>
                Clear
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 