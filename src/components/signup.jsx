import React, { useState } from "react";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import BeatLoader from "react-spinners/BeatLoader";
import Error from "@/components/error";
import * as Yup from "yup";
import { signup as signupApi } from "@/db/apiAuth";
import { data, useNavigate, useSearchParams } from "react-router-dom";

const Signup = () => {
  const [errors, setErrors] = useState({});
  const [formData, setFormData ] = useState ({ email: "", password: "", name:"", profil_pic:null,});
  const [loading, setLoading] = useState(false);
  const [networkError, setNetworkError] = useState(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const longLink = searchParams.get("createNew");

  const handleInputChange = (e) => {
    const {name, value, files } = e.target;
    setFormData ((prevState) => ({ ...prevState, [name]: files ? files[0]: value,}))
  };

  const handleSignup = async () => {
    // Reset errors vider la liste des erreurs
    setErrors({});
    setNetworkError(null);

    try {
        //  validation email et mot de passe avec Yup
      const schema = Yup.object().shape({
        name: Yup.string().required("Name is required"),
        email: Yup.string().email("Invalid Email").required("Email is required"),
        password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
        profil_pic: Yup.mixed().required("file", "Profile is required"),

      })
      await schema.validate(formData, {abortEarly: false});

      // appel supabase
      setLoading(true);
      const signupResponse = await signupApi(formData); // { user, session }

    if (!signupResponse.session) {
      // Email de confirmation requis → ne pas envoyer sur dashboard
      // Ex: setNetworkError("Check your email to confirm your account.");
      // navigate('/check-email');
    } else {
      navigate(`/dashboard${longLink ? `?createNew=${longLink}` : ""}`);
    }


    } catch (e) {

      // Erreurs Yup (input par input)
      if (e?.inner?.length) {
        const fieldErrors = {};
        e.inner.forEach((err) => { fieldErrors[err.path] = err.message; });
        setErrors(fieldErrors);
      } else {
        // Erreur Supabase / réseau
        setNetworkError(e.message || "Signup failed");
      }
    } finally {
      setLoading(false);
    }
  };
  return (
      <Card>
        <CardHeader>
          <CardTitle>Signup</CardTitle>
          <CardDescription>To your account if already have one</CardDescription>
          {networkError && <Error message={networkError} />}
        </CardHeader>

        <CardContent className="space-y-2">
          <div className="space-y-1">
            <Input
              name="name"
              type="text"
              placeholder="Enter name"
              value ={formData.name}
              onChange={handleInputChange}
            />
           {errors.name && <Error message={errors.name} />}
          </div>
          <div className="space-y-1">
            <Input
              name="email"
              type="email"
              placeholder="Enter Email"
              value ={formData.email}
              onChange={handleInputChange}
            />
           {errors.email && <Error message={errors.email} />}
          </div>
          <div className="space-y-1">
            <Input
              name="password"
              type="password"
              placeholder="Enter password"
              value ={formData.password}
              onChange={handleInputChange}
            />
           {errors.password && <Error message={errors.password} />}
          </div>
          <div className="space-y-1">
            <Input
              name="profil_pic"
              type="file"
              accept="image/*"
              onChange={handleInputChange}
            />
           {errors.profil_pic && <Error message={errors.profil_pic} />}
          </div>
        </CardContent>

        <CardFooter>
          <Button onClick={handleSignup} disabled={loading}>
            {loading ? < BeatLoader size={10} color="#36d7b7"/> : "Create account"}
          </Button>
        </CardFooter>
      </Card>
  )
};

export default Signup;
