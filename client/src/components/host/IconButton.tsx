"use client";

import { useState } from "react";
import { LuSquarePen, LuTrash2 } from "react-icons/lu";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Reference, useMutation } from "@apollo/client";
import { DELETE_PROPERTY_MUTATION } from "@/graphql/property";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type ActionType = "edit" | "delete";

interface IconButtonProps {
  actionType: ActionType;
  onClick?: () => void;
  className?: string;
  isLoading?: boolean;
  disabled?: boolean;
  propertyId?: string;
}

export const IconButton = ({
  actionType,
  onClick,
  className,
  isLoading = false,
  disabled = false,
  propertyId,
}: IconButtonProps) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const iconMap = {
    edit: <LuSquarePen className="h-4 w-4" />,
    delete: <LuTrash2 className="h-4 w-4" />,
  };

  const tooltipMap = {
    edit: "Edit property",
    delete: "Delete property",
  };

  // Delete property mutation
  const [deleteProperty, { loading: deleteLoading }] =
    useMutation(DELETE_PROPERTY_MUTATION, {
      variables: { id: propertyId },
      onCompleted: () => {
        setIsOpen(false);
        router.refresh();
      },
      update: (cache) => {
        cache.modify({
          fields: {
            myProperties: (
              existingProperties = [],
              { readField }
            ) => {
              return existingProperties.filter(
                (propertyRef: Reference) =>
                  propertyId !==
                  readField("id", propertyRef)
              );
            },
          },
        });
      },
    });

  const handleDelete = () => {
    deleteProperty();
  };

  // For edit button, just use the onClick passed from props
  const handleClick = () => {
    if (actionType === "edit" && onClick) {
      onClick();
    }
  };

  // Render delete button with alert dialog
  if (actionType === "delete") {
    return (
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogTrigger asChild>
          <Button
            size="icon"
            variant="destructive"
            className={cn(
              "transition-all hover:bg-destructive/90 focus:ring-red-500",
              className
            )}
            disabled={isLoading || disabled}
            aria-label={tooltipMap[actionType]}
            title={tooltipMap[actionType]}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              iconMap[actionType]
            )}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete this
              property and all associated data. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleteLoading
                ? "Deleting..."
                : "Delete Property"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // Render edit button
  return (
    <Button
      size="icon"
      variant="outline"
      className={cn(
        "transition-all hover:bg-slate-100 focus:ring-blue-500",
        className
      )}
      onClick={handleClick}
      disabled={isLoading || disabled}
      aria-label={tooltipMap[actionType]}
      title={tooltipMap[actionType]}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        iconMap[actionType]
      )}
    </Button>
  );
};
