"use client";

import React, { useState, useEffect } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useQuery } from "@apollo/client";
import { AlertCircle } from "lucide-react";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import Container from "@/components/Container";
import Loader from "@/components/Loader";
import PasswordForm from "./components/PasswordForm";
import ProfileForm from "./components/ProfileForm";
import { useAuth } from "@/stores/authStore";
import { GET_CURRENT_USER } from "@/graphql/user/queries";

const ProfilePage = () => {
  const router = useRouter();
  const {
    isAuthenticated,
    user,
    isLoading: authLoading,
  } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  const {
    data,
    loading: profileLoading,
    error,
  } = useQuery(GET_CURRENT_USER, {
    fetchPolicy: "network-only",
    onError: (error) => {
      console.error("Error fetching profile:", error);
    },
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || profileLoading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Loader />;
  }

  if (error) {
    return (
      <Container>
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading profile. Please try again later.
          </AlertDescription>
        </Alert>
      </Container>
    );
  }

  const userData = data?.me || user;

  if (!userData) {
    return (
      <Container>
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Unable to load user data.
          </AlertDescription>
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <div className="pb-10 pt-12 mx-auto w-full max-w-[900px]">
        <h1 className="text-2xl font-semibold mb-8 capitalize">
          Your profile
        </h1>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="profile">
              Profile Information
            </TabsTrigger>
            <TabsTrigger value="security">
              Password & Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
                <ProfileForm userData={userData} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
              </CardHeader>
              <CardContent>
                <PasswordForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Container>
  );
};

export default ProfilePage;
