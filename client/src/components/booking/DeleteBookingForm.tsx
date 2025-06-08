"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";
import { useCancelBooking } from "@/hooks/useBooking";
import { useState } from "react";
import { toast } from "sonner";
import { DeleteBookingFormData } from "@/types/booking";
import { deleteBookingSchema } from "@/schema/booking";

function DeleteBookingForm({
  bookingId,
  onSuccess,
}: {
  bookingId: string;
  onSuccess?: () => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const [cancelBooking] = useCancelBooking(
    () => {
      toast.success("Booking cancelled successfully");
      onSuccess?.();
      setIsDeleting(false);
    },
    (error) => {
      console.error("Cancel booking error:", error);
      toast.error(
        "Failed to cancel booking. Please try again."
      );
      setIsDeleting(false);
    }
  );

  const form = useForm<DeleteBookingFormData>({
    resolver: zodResolver(deleteBookingSchema),
    defaultValues: {
      bookingId,
    },
  });

  const onSubmit = async (data: DeleteBookingFormData) => {
    try {
      setIsDeleting(true);
      await cancelBooking({
        variables: {
          id: data.bookingId,
        },
      });
    } catch {
      // Silent error handling
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="inline"
      >
        <FormField
          control={form.control}
          name="bookingId"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <input type="hidden" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          disabled={isDeleting}
          className="h-8 w-8 text-white hover:text-red-300 hover:bg-white/10 transition-colors duration-200"
          title="Cancel Booking" // Added for clarity
        >
          {isDeleting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </form>
    </Form>
  );
}

export default DeleteBookingForm;
