import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { z } from "zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDeleteUser, useGetUser, useUpdateUser } from "@/api/user";
import { useAppContext } from "@/context/useAppContext";
import { useNavigate } from "react-router-dom";
import { useLogout } from "@/api/auth";
import { motion } from "framer-motion";

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phoneNo: z.string().optional(),
  avatarUrl: z.string().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

const UserUpdateForm = () => {
  const { userId, validateToken } = useAppContext();
  const { user } = useGetUser(userId as string);
  const { updateUser } = useUpdateUser();
  const { deleteUser } = useDeleteUser();
  const { logoutUser } = useLogout();
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl);
  const navigate = useNavigate();

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phoneNo: user?.phoneNo || "",
      avatarUrl: user?.avatarUrl,
    },
  });

  useEffect(() => {
    form.reset({
      name: user?.name || "",
      email: user?.email || "",
      phoneNo: user?.phoneNo || "",
      avatarUrl: avatarUrl,
    });
  }, [user, avatarUrl, form]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAvatarUpload = (result: any) => {
    if (result?.event === "success") {
      setAvatarUrl(result?.info?.secure_url);
      form.setValue("avatarUrl", result?.info?.secure_url);
    }
  };

  const handleUploadClick = () => {
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
        uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESETS,
        sources: ["local", "url", "camera"],
        cropping: true,
        multiple: false,
        clientAllowedFormats: ["jpg", "png", "jpeg"],
        theme: "minimal",
        maxFileSize: 10000000,
        folder: "chat-app",
        accessMode: "private",
      },
      // @ts-expect-error: Expect an error on the next line
      (error, result) => {
        if (result && result.event === "success") {
          handleAvatarUpload(result);
        } else if (error) {
          console.error("Upload Widget Error:", error);
        }
      }
    );
    widget.open();
  };

  const onSubmit = async (data: UserFormData) => {
    const formData = { ...data, avatarUrl };
    if (user && user._id) {
      await updateUser({ id: user._id, formData });
    }
  };

  const handleDelete = async () => {
    if (userId) {
      await deleteUser(userId);
      navigate("/");
      await logoutUser();
      navigate("/auth/login");
      await validateToken();
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <motion.div
            className="space-y-6 bg-white p-8 rounded-lg shadow-lg border"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-green-500">
                Update User Information
              </h1>
            </div>
            <FormField
              control={form.control}
              name="avatarUrl"
              render={() => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">
                    Profile Picture
                  </FormLabel>
                  <FormControl>
                    <div className="flex  gap-8">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt="Avatar Preview"
                          className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-green-500 shadow-lg"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full border-2 border-gray-300 bg-gray-200 flex items-center justify-center">
                          <span className="text-xs text-gray-500">
                            No Image
                          </span>
                        </div>
                      )}
                      <Button
                        type="button"
                        onClick={handleUploadClick}
                        className="bg-green-500 text-white rounded-lg px-6 py-2 mt-6 hover:bg-green-600 "
                      >
                        Change Profile image 
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter user name"
                      {...field}
                      className="input-primary"
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
                  <FormLabel className="text-lg font-semibold">Email</FormLabel>
                  <FormControl>
                    <Input
                      disabled
                      placeholder="Email"
                      value={field.value}
                      className="input-primary"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">
                    Phone Number
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled
                      placeholder="Phone Number"
                      value={field.value}
                      className="input-primary"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-between py-4">
              <Button
                onClick={handleDelete}
                variant={"destructive"}
                className="bg-red-500 hover:bg-red-600 px-6 py-2 text-white rounded-lg"
              >
                Delete Account
              </Button>
              <Button className="bg-green-500 hover:bg-green-600" type="submit">
                Save Changes
              </Button>
            </div>
          </motion.div>
        </form>
      </Form>
    </div>
  );
};

export default UserUpdateForm;
