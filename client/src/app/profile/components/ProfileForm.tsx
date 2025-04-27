"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@apollo/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AlertCircle, Camera } from "lucide-react";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import Image from "next/image";
import { UPDATE_PROFILE_MUTATION } from "@/graphql/user/mutations";
import { GET_CURRENT_USER } from "@/graphql/user/queries";
import {
  User,
  ProfileFormData,
  ProfileError,
} from "@/types/user";
import { profileSchema } from "@/schema/user";

const Avatar: React.FC<{
  src: string | null | undefined;
}> = ({ src }) => {
  return (
    <Image
      className="rounded-full"
      height={96}
      width={96}
      alt="Avatar"
      src={src || "/images/placeholder.jpg"}
    />
  );
};

interface ProfileFormProps {
  userData: User;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  userData,
}) => {
  const [updateMe, { loading }] = useMutation(
    UPDATE_PROFILE_MUTATION,
    {
      refetchQueries: [{ query: GET_CURRENT_USER }],
      onError: (error) => {
        setError({
          general:
            error.message || "Failed to update profile",
        });
      },
    }
  );

  const [error, setError] = useState<ProfileError | null>(
    null
  );
  const [previewImage, setPreviewImage] = useState<
    string | null
  >(userData.profileImage || null);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: userData.name || "",
      email: userData.email || "",
      profileImage: undefined,
    },
  });

  const handleProfileImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError({
        profileImage: "Image size should be less than 5MB",
      });
      return;
    }

    // Create preview URL
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Store file in form
    form.setValue("profileImage", file);
    setError(null);
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setError(null);

      // Create update input with only changed fields
      const updateInput: {
        name?: string;
        email?: string;
        profileImage?: string;
      } = {};

      // Only include name if it's different and not empty
      if (data.name !== userData.name && data.name.trim()) {
        updateInput.name = data.name.trim();
      }

      // Only include email if it's different and not empty
      if (
        data.email !== userData.email &&
        data.email.trim()
      ) {
        updateInput.email = data.email.trim();
      }

      // Handle image if present
      if (data.profileImage instanceof File) {
        // Simple conversion to base64
        const base64Image = await new Promise<string>(
          (resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(data.profileImage as Blob);
            reader.onload = () => {
              const base64String = reader.result as string;
              const base64Data = base64String.split(",")[1];
              resolve(base64Data);
            };
            reader.onerror = (error) => reject(error);
          }
        );

        updateInput.profileImage = base64Image;
      }

      // Check if there's anything to update
      if (Object.keys(updateInput).length === 0) {
        toast.info("No changes to save");
        return;
      }

      const { data: responseData } = await updateMe({
        variables: {
          updateMeInput: updateInput,
        },
      });

      if (responseData?.updateMe) {
        toast.success("Profile updated successfully");
      } else {
        toast.info("No changes were made");
      }
    } catch (err) {
      const error = err as Error;
      setError({
        general:
          error.message || "Failed to update profile",
      });
    }
  };

  return (
    <Form {...form}>
      {error?.general && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error.general}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col items-center mb-8">
        <div className="relative mb-4">
          <Avatar src={previewImage} />
          <div className="absolute bottom-0 right-0">
            <label
              htmlFor="profile-image"
              className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-white cursor-pointer hover:bg-primary-hover"
            >
              <Camera className="h-4 w-4" />
            </label>
            <input
              id="profile-image"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleProfileImageChange}
            />
          </div>
        </div>
        {error?.profileImage && (
          <p className="text-sm text-red-500 mt-1">
            {error.profileImage}
          </p>
        )}
      </div>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Your full name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Your email address"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          className="w-full md:w-auto bg-primary hover:bg-primary-hover"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </Form>
  );
};

export default ProfileForm;
