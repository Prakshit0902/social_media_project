"use client";
import React, { useCallback } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { cn } from "../../lib/utils";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { useState } from "react"; 
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signupUser } from "../../store/slices/userSlice";


export function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const {loading,user,error} = useSelector((state) => state.user)   
  const [nameData,setNameData] = useState({ firstname: '', lastname: '' })
  const [formData,setFormData] = useState({email : '',password : '',username : 'ndead',fullname : 'prakshit suthar'})
  const [confirmpassword,setConfirmPassword] = useState('')

  

  const signInButtonClick = () => {
      navigate('/')
    }
    
    
    // const handleChange = useCallback((e) => {
    //     setFormData({...formData, [e.target.id ]: e.target.value})
    // },[])
    
    // const handleNameChange = (e) => {
    //     const { id, value } = e.target;
    //     const updatedName = { ...nameData, [id]: value };
    //     setNameData(updatedName);
    //     setFormData({ ...formData, fullname: `${updatedName.firstname} ${updatedName.lastname}` });
    // }

    // const handleSubmit = (e) => {
    //       e.preventDefault()
    //       if (formData.password != confirmpassword){
    //         alert('Passwords do not match')
    //         return
    //       }
    //       dispatch(signupUser(formData))
    //     }


  const handleChange = useCallback(
    (e) => {
      setFormData({ ...formData, [e.target.id]: e.target.value });
    },
    [formData]
  );

  const handleNameChange = (e) => {
    const { id, value } = e.target;
    const updatedName = { ...nameData, [id]: value };
    setNameData(updatedName);
    setFormData({
      ...formData,
      fullname: `${updatedName.firstname} ${updatedName.lastname}`,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== confirmpassword) {
      alert("Passwords do not match");
      return;
    }
    dispatch(signupUser(formData));
  }
  return (
    <div
      className="shadow-input w-full h-full rounded-none bg-white/10 backdrop-blur-sm p-4 md:rounded-2xl dark:bg-black/10 ">
      <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">
        Sign Up Here
      </h2>
      {/* <p className="mt-2 max-w-sm text-xl text-neutral-600 dark:text-neutral-300">
        Login to MyProject if you can because we don&apos;t have a login flow
        yet
      </p> */}
      <form className="my-8" onSubmit={handleSubmit}>
        <div
          className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
          <LabelInputContainer>
            <Label htmlFor="firstname">First name</Label>
            <Input id="firstname" placeholder="Tyler" type="text" onChange = {handleNameChange}/>
          </LabelInputContainer>
          <LabelInputContainer>
            <Label htmlFor="lastname">Last name</Label>
            <Input id="lastname" placeholder="Durden" type="text" onChange = {handleNameChange} />
          </LabelInputContainer>
        </div>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="email">Email Address</Label>
          <Input className = 'text-lg' id="email" placeholder="yourmail@email.com" type="email" onChange = {handleChange}/>
        </LabelInputContainer>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              placeholder="••••••••"
              type={showPassword ? "text" : "password"}
              className="pr-10" onChange = {handleChange}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-black dark:hover:text-white"
            >
              {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
            </button>
          </div>
        </LabelInputContainer>
        <LabelInputContainer className="mb-8">
          <Label htmlFor="confirmpassword">Confirm password</Label>
          <Input id="confirmpassword" placeholder="••••••••" type="password" onChange={(e) => setConfirmPassword(e.target.value)}/>
        </LabelInputContainer>

        <button
          className="mt-8  group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
          type="submit" >
          Sign Up &rarr;
          <BottomGradient />
        </button>

         <p className="mt-9 max-w-sm text-sm text-center text-neutral-600 dark:text-neutral-300">
            Have an account! Sign In here 
        </p>
        <button
            className="mt-4 group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
            type="submit" onClick={signInButtonClick}>
            Sign In &rarr;
            <BottomGradient />
        </button>


      </form>
    </div>
  );
}

export function BottomGradient() {
  return (
    <>
      <span
        className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span
        className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};
