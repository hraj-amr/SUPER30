import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { Field, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import FormSection from "@/components/FormSection";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload } from "@/components/FileUpload";

export default function RegisterStudent() {
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({});
  const [scholarship, setScholarship] = useState(false);
  const [passportPhoto, setPassportPhoto] = useState(null);
  const [identityPhoto, setIdentityPhoto] = useState(null);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, classMoving: "10th to 11th" }));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (name, file) => {
  if (name === "passportPhoto") setPassportPhoto(file);
  if (name === "identityPhoto") setIdentityPhoto(file);
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      const form = new FormData();
      Object.keys(formData).forEach((key) => form.append(key, formData[key]));

      if (passportPhoto) form.append("passportPhoto", passportPhoto);
      if (identityPhoto) form.append("identityPhoto", identityPhoto);

      const res = await axios.post(
        "http://localhost:8000/api/students/register",
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      toast.success("Registration Successful!", {
        description: `Student ID: ${res.data.studentId}`,
      });

      navigate(`/success/${res.data.studentId}`, {
        state: { studentName: formData.studentName }
      });

    } catch (error) {
      toast.error("Registration Failed", {
        description: error.response?.data?.error || error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
  <main className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
  <div className="max-w-4xl mx-auto">
    <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">Student Registration</h1>
          <p className="text-base sm:text-lg text-muted-foreground">Complete the form below to enroll in our institution</p>
    </div>
    
    <form
      onSubmit={handleSubmit}
      encType="multipart/form-data"
      className="space-y-4 sm:space-y-6"
    >
      <FormSection title="Personal Information" description="Enter your basic personal details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Student Name */}
          <Field>
            <FieldLabel className="block text-sm font-medium text-foreground mb-2">Student Name<span className="text-red-500"> *</span></FieldLabel>
            <Input className="border border-slate-200 rounded-lg bg-white w-full" name="studentName" placeholder="Enter Your Full Name" onChange={handleChange} required />
          </Field>

          {/* DOB */}
          <Field>
            <FieldLabel className="block text-sm font-medium text-foreground mb-2">Date of Birth<span className="text-red-500"> *</span></FieldLabel>
            <Input className="border border-slate-200 rounded-lg bg-white w-full" type="date" name="dateOfBirth" onChange={handleChange} required />
          </Field>

          {/* Gender */}
          <Field>
            <FieldLabel className="block text-sm font-medium text-foreground mb-2">Gender<span className="text-red-500"> *</span></FieldLabel>
            <Input className="border border-slate-200 rounded-lg bg-white w-full" name="gender" placeholder="Male / Female" onChange={handleChange} required />
          </Field>

          {/* Email Address */}
          <Field>
            <FieldLabel className="block text-sm font-medium text-foreground mb-2">Email Address<span className="text-red-500"> *</span></FieldLabel>
            <Input className="border border-slate-200 rounded-lg bg-white w-full" type="email" name="email" placeholder="example@gmail.com" onChange={handleChange} required />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Family Information" description="Enter your parent's details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Father Name */}
          <Field>
            <FieldLabel className="block text-sm font-medium text-foreground mb-2">Father Name<span className="text-red-500"> *</span></FieldLabel>
            <Input className="border border-slate-200 rounded-lg bg-white w-full" name="fatherName" placeholder="Enter Father's Full Name" onChange={handleChange} required />
          </Field>

          {/* Mother Name */}
          <Field>
            <FieldLabel className="block text-sm font-medium text-foreground mb-2">Mother Name<span className="text-red-500"> *</span></FieldLabel>
            <Input className="border border-slate-200 rounded-lg bg-white w-full" name="motherName" placeholder="Enter Mother's Full Name" onChange={handleChange} required />
          </Field>

          {/* Parent Mobile */}
          <Field>
            <FieldLabel className="block text-sm font-medium text-foreground mb-2">Parent Mobile No.<span className="text-red-500"> *</span></FieldLabel>
            <div className="flex items-center w-full"><span className="h-10 flex items-center px-3 bg-slate-100 border border-slate-200/60 border-r-0 rounded-l-lg shadow-sm text-sm text-slate-700 whitespace-nowrap">
              +91
            </span><Input className="h-10 bg-white border border-slate-200/60 border-l-0 rounded-l-none rounded-r-lg shadow-sm w-full flex-1" type="tel" name="parentMobile" placeholder="Enter Mobile Number" maxLength="10" onChange={handleChange} required />
            </div>
          </Field>

          {/* Student Mobile */}
          <Field>
            <FieldLabel className="block text-sm font-medium text-foreground mb-2">Student Mobile No.<span className="text-red-500"> *</span></FieldLabel>
            <div className="flex items-center w-full"><span className="h-10 flex items-center px-3 bg-slate-100 border border-slate-200/60 border-r-0 rounded-l-lg shadow-sm text-sm text-slate-700 whitespace-nowrap">
              +91
            </span><Input className="h-10 bg-white border border-slate-200/60 border-l-0 rounded-l-none rounded-r-lg shadow-sm w-full flex-1" type="tel" name="studentMobile" placeholder="Enter Mobile Number" maxLength="10" onChange={handleChange} required /></div>
          </Field>
        </div>
      </FormSection>

      <FormSection title="Address Information" description="Provide your residential details">
        <div className="space-y-4">
          {/* Permanent Address */}
          <Field className="col-span-2">
            <FieldLabel className="block text-sm font-medium text-foreground mb-2">Permanent Address<span className="text-red-500"> *</span></FieldLabel>
            <textarea
              name="permanentAddress"
              placeholder="Enter Your Permanent Address"
              onChange={handleChange}
              className="border border-slate-200 rounded-lg p-3 bg-white placeholder:text-sm w-full min-h-20"
              required
            />
          </Field>

          {/* Present Address */}
          <Field className="col-span-2">
            <FieldLabel className="block text-sm font-medium text-foreground mb-2">Present Address<span className="text-red-500"> *</span></FieldLabel>
            <textarea
              name="presentAddress"
              placeholder="Enter Your Present Address"
              onChange={handleChange}
              className="border border-slate-200 rounded-lg p-3 bg-white placeholder:text-sm w-full min-h-20"
              required
            />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Academic Information" description="Select your academic preferences and previous school details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Class Moving */}
          <Field>
            <FieldLabel className="block text-sm font-medium text-foreground mb-2">Class Moving To<span className="text-red-500"> *</span></FieldLabel>
            <Select value="10th to 11th" disabled>
              <SelectTrigger className="bg-gray-100 cursor-not-allowed border border-slate-200 text-black w-full">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="10th to 11th">10th to 11th</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          {/* Stream */}
          <Field>
            <FieldLabel className="block text-sm font-medium text-foreground mb-2">Select Stream<span className="text-red-500"> *</span></FieldLabel>
            <Select
              value={formData.stream || ""}                 // controlled value
              onValueChange={(value) =>
                setFormData({ ...formData, stream: value }) // update form data
              }
            >
              <SelectTrigger className="border border-slate-200 rounded-lg bg-white focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:ring-offset-0 focus-visible:ring-offset-0 w-full">
                <SelectValue placeholder="Select Stream" />
              </SelectTrigger>

              <SelectContent className="bg-white border border-slate-200/70 shadow-[0_4px_20px_rgba(0,0,0,0.08)] rounded-xl p-1">
                <SelectItem value="PCM" className="text-sm px-3 py-2 rounded-lg cursor-pointer transition text-slate-700 hover:bg-slate-100/70 data-highlighted:bg-slate-100/70 data-highlighted:text-slate-700 data-[state=checked]:bg-slate-200/60 data-[state=checked]:font-medium data-[state=checked]:text-slate-700">
                  PCM
                </SelectItem>

                <SelectItem value="PCB" className="text-sm px-3 py-2 rounded-lg cursor-pointer transition text-slate-700 hover:bg-slate-100/70 data-highlighted:bg-slate-100/70 data-highlighted:text-slate-700 data-[state=checked]:bg-slate-200/60 data-[state=checked]:font-medium data-[state=checked]:text-slate-700">
                  PCB
                </SelectItem>
              </SelectContent>
            </Select>
          </Field>

          {/* Target */}
          <Field>
            <FieldLabel className="block text-sm font-medium text-foreground mb-2">Target<span className="text-red-500"> *</span></FieldLabel>
            <Select
              value={formData.target || ""}
              onValueChange={(value) =>
                setFormData({ ...formData, target: value })
              }
            >
              <SelectTrigger className="border border-slate-200 rounded-lg bg-white focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:ring-offset-0 focus-visible:ring-offset-0 w-full">
                <SelectValue placeholder="Select Target" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="JEE" className="text-sm px-3 py-2 rounded-lg cursor-pointer transition text-slate-700 hover:bg-slate-100/70 data-highlighted:bg-slate-100/70 data-highlighted:text-slate-700 data-[state=checked]:bg-slate-200/60 data-[state=checked]:font-medium data-[state=checked]:text-slate-700">JEE</SelectItem>
                <SelectItem value="NEET" className="text-sm px-3 py-2 rounded-lg cursor-pointer transition text-slate-700 hover:bg-slate-100/70 data-highlighted:bg-slate-100/70 data-highlighted:text-slate-700 data-[state=checked]:bg-slate-200/60 data-[state=checked]:font-medium data-[state=checked]:text-slate-700">NEET</SelectItem>
                <SelectItem value="CBSE Board" className="text-sm px-3 py-2 rounded-lg cursor-pointer transition text-slate-700 hover:bg-slate-100/70 data-highlighted:bg-slate-100/70 data-highlighted:text-slate-700 data-[state=checked]:bg-slate-200/60 data-[state=checked]:font-medium data-[state=checked]:text-slate-700">CBSE Board</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          {/* Previous Result */}
          <Field>
            <FieldLabel className="block text-sm font-medium text-foreground mb-2">Student's Previous Result (In Percentage)<span className="text-red-500"> *</span></FieldLabel>
            <Input className="border border-slate-200 rounded-lg bg-white w-full" placeholder="Enter Percentage" type="number" name="previousResultPercentage" step="0.01" min="0" max="100" onChange={handleChange} />
          </Field>

          {/* Previous School */}
          <Field>
            <FieldLabel className="block text-sm font-medium text-foreground mb-2">Previous School Name<span className="text-red-500"> *</span></FieldLabel>
            <Input className="border border-slate-200 rounded-lg bg-white w-full" placeholder="Enter Previous School Name" name="previousSchool" onChange={handleChange} required />
          </Field>

          {/* Test Centre */}
          <Field>
            <FieldLabel className="block text-sm font-medium text-foreground mb-2">Test Centre<span className="text-red-500"> *</span></FieldLabel>
            <Select
              value="British School Gurukul, Near Chopra Agencies, South Bisar Tank, Gaya (Bihar)"
              disabled
            >
              <SelectTrigger className="bg-gray-100 cursor-not-allowed text-slate-700 border border-slate-200 rounded-lg opacity-70 w-full">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="British School Gurukul, Near Chopra Agencies, South Bisar Tank, Gaya (Bihar)">
                  British School Gurukul, Near Chopra Agencies, South Bisar Tank, Gaya (Bihar)
                </SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      </FormSection>

      <FormSection title="Scholarship Details" description="Provide scholarship information if applicable">
        <div className="space-y-4">
          {/* Scholarship option */}
          <Field>
            <FieldLabel className="block text-sm font-medium text-foreground mb-2">Scholarship Offered?<span className="text-red-500"> *</span></FieldLabel>
            <Select
              value={formData.scholarshipOffered === true ? "yes" : formData.scholarshipOffered === false ? "no" : ""}
              onValueChange={(value) => {
                const boolValue = value === "yes";
                setScholarship(boolValue);
                setFormData({ ...formData, scholarshipOffered: boolValue });
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="yes" className="text-sm px-3 py-2 rounded-lg cursor-pointer transition text-slate-700 hover:bg-slate-100/70 data-highlighted:bg-slate-100/70 data-highlighted:text-slate-700 data-[state=checked]:bg-slate-200/60 data-[state=checked]:font-medium data-[state=checked]:text-slate-700">Yes</SelectItem>
                <SelectItem value="no" className="text-sm px-3 py-2 rounded-lg cursor-pointer transition text-slate-700 hover:bg-slate-100/70 data-highlighted:bg-slate-100/70 data-highlighted:text-slate-700 data-[state=checked]:bg-slate-200/60 data-[state=checked]:font-medium data-[state=checked]:text-slate-700">No</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          {/* Scholarship Details */}
          <Field className="col-span-2">
            <FieldLabel className="block text-sm font-medium text-foreground mb-2">Scholarship Details</FieldLabel>
            <textarea
              name="scholarshipDetails"
              placeholder="Specify Scholarship details (From Where and How Much)"
              onChange={handleChange}
              disabled={!scholarship}
              className={`border border-slate-200 rounded-lg p-3 bg-white placeholder:text-sm w-full min-h-20 ${
                !scholarship ? "bg-slate-100 border border-slate-200/60 cursor-not-allowed" : ""
              }`}
            />
          </Field>
        </div>
      </FormSection>

       <FormSection title="Document Upload" description="Upload required documents">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Photo Uploads */}
          <Field>
            <FieldLabel className="block text-sm font-medium text-foreground mb-2">Recent Passport Size Photo<span className="text-red-500"> *</span></FieldLabel>
            <FileUpload
              name="passportPhoto"
              accept="image/*"
              onFileSelect={handleFileChange}
            />
          </Field>

          <Field>
            <FieldLabel className="block text-sm font-medium text-foreground mb-2">School ID Card / Identity Proof (Aadhar Card)<span className="text-red-500"> *</span></FieldLabel>
            <FileUpload
              name="identityPhoto"
              accept="image/*"
              onFileSelect={handleFileChange}
            />
          </Field>
        </div>
      </FormSection>

      {/* Submit button with spinner */}
      <Button
        disabled={isSubmitting}
        type="submit"
        className="col-span-2 justify-self-center w-full sm:w-fit flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Spinner /> Registering...
          </>
        ) : (
          "Register Student"
        )}
      </Button>
    </form>
  </div>
</main>
);

}