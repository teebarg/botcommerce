// "use client";

// import { ChevronDown, Eye, EyeSlashFilled, Mail } from "nui-react-icons";
// import React, { useState } from "react";

// interface Props {}

// const Beaf: React.FC<Props> = () => {
//     const [showPassword, setShowPassword] = useState(false);
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
//             <header className="p-4 border-b border-gray-800">
//                 <div className="max-w-7xl mx-auto flex justify-between items-center">
//                     <div className="text-white text-xl font-semibold">IBM Cloud</div>
//                     <nav className="flex gap-6">
//                         <a href="#" className="text-gray-300 hover:text-white transition">
//                             Catalog
//                         </a>
//                         <a href="#" className="text-gray-300 hover:text-white transition">
//                             Cost estimator
//                         </a>
//                         <a href="#" className="text-gray-300 hover:text-white transition">
//                             Docs
//                         </a>
//                     </nav>
//                 </div>
//             </header>

//             <main className="max-w-7xl mx-auto px-4 py-12 flex flex-col lg:flex-row gap-12">
//                 <div className="lg:w-1/2">
//                     <h1 className="text-3xl font-bold text-white mb-2">
//                         Create an IBM <span className="text-blue-500">Cloud</span> account
//                     </h1>
//                     <p className="text-gray-400 mb-8">
//                         Already have an IBM Cloud account?{" "}
//                         <a href="#" className="text-blue-400 hover:text-blue-300 transition">
//                             Log in
//                         </a>
//                     </p>

//                     <div className="space-y-6">
//                         {/* Account Information Section */}
//                         <div className="bg-gray-800 rounded-lg p-6">
//                             <div className="flex items-center gap-2 mb-6">
//                                 <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
//                                 <h2 className="text-white font-semibold">Account information</h2>
//                             </div>

//                             <div className="space-y-4">
//                                 <div>
//                                     <label className="block text-gray-300 text-sm mb-2">Email</label>
//                                     <div className="relative">
//                                         <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                                         <input
//                                             type="email"
//                                             value={email}
//                                             onChange={(e) => setEmail(e.target.value)}
//                                             className="w-full bg-gray-700 text-white rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                             placeholder="Enter your email"
//                                         />
//                                     </div>
//                                 </div>

//                                 <div>
//                                     <label className="block text-gray-300 text-sm mb-2">Password</label>
//                                     <div className="relative">
//                                         {/* <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" /> */}
//                                         <input
//                                             type={showPassword ? "text" : "password"}
//                                             value={password}
//                                             onChange={(e) => setPassword(e.target.value)}
//                                             className="w-full bg-gray-700 text-white rounded-md py-2 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                             placeholder="Enter your password"
//                                         />
//                                         <button
//                                             onClick={() => setShowPassword(!showPassword)}
//                                             className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
//                                         >
//                                             {showPassword ? <EyeSlashFilled className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//                                         </button>
//                                     </div>
//                                 </div>
//                             </div>

//                             <button className="mt-6 bg-blue-500 text-white w-32 py-2 rounded-md hover:bg-blue-600 transition flex items-center justify-center gap-2">
//                                 Next
//                                 <ChevronDown className="w-4 h-4" />
//                             </button>
//                         </div>

//                         {/* Other Sections (Collapsed) */}
//                         <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6">
//                             <div className="flex items-center gap-2">
//                                 <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
//                                 <h2 className="text-gray-400 font-semibold">Verify email</h2>
//                             </div>
//                         </div>

//                         <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6">
//                             <div className="flex items-center gap-2">
//                                 <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
//                                 <h2 className="text-gray-400 font-semibold">Personal information</h2>
//                             </div>
//                         </div>

//                         <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6">
//                             <div className="flex items-center gap-2">
//                                 <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
//                                 <h2 className="text-gray-400 font-semibold">Account notice</h2>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Benefits Section */}
//                 <div className="lg:w-1/2 space-y-8">
//                     <div className="bg-gray-800 rounded-lg p-6">
//                         <div className="flex items-start gap-4">
//                             <div className="mt-1">{/* <Lock className="w-6 h-6 text-blue-400" /> */}</div>
//                             <div>
//                                 <h3 className="text-white font-semibold mb-2">Unlock the full IBM Cloud Catalog</h3>
//                                 <p className="text-gray-400">
//                                     Get started with everything you need to take your projects to the next level. Including always-free products like
//                                     IBM Watson® APIs. They never expire and you can't be charged for them—ever.
//                                 </p>
//                             </div>
//                         </div>
//                     </div>

//                     <div className="bg-gray-800 rounded-lg p-6">
//                         <div className="flex items-start gap-4">
//                             {/* <AlertCircle className="w-6 h-6 text-green-400 mt-1" /> */}
//                             <div>
//                                 <h3 className="text-white font-semibold mb-2">200 USD Cloud Credit for free</h3>
//                                 <p className="text-gray-400">Try any IBM Cloud product with $200 in credit to use over the next 30 days.</p>
//                             </div>
//                         </div>
//                     </div>

//                     <div className="bg-gray-800 rounded-lg p-6">
//                         <div className="flex items-start gap-4">
//                             {/* <AlertCircle className="w-6 h-6 text-purple-400 mt-1" /> */}
//                             <div>
//                                 <h3 className="text-white font-semibold mb-2">Get started for free</h3>
//                                 <p className="text-gray-400">
//                                     We ask for your credit card to verify your identity. You will not be charged for any usage within the free tier.{" "}
//                                     <a href="https://www.ibm.com/cloud/free" className="text-blue-400 hover:text-blue-300">
//                                         Learn more
//                                     </a>
//                                 </p>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </main>

//             <footer className="mt-12 border-t border-gray-800 py-4">
//                 <div className="max-w-7xl mx-auto px-4">
//                     <p className="text-gray-500 text-sm">© Copyright IBM Corp. 2014, 2025. All rights reserved.</p>
//                 </div>
//             </footer>
//         </div>
//     );
// };

// export default Beaf;

"use client";

import { useState } from "react";
// import { Eye, EyeOff, ChevronDown, ArrowRight, CheckCircle2 } from "lucide-react";
import { ChevronDown, Eye, EyeSlashFilled, Mail } from "nui-react-icons";

export default function SignupForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header */}
            <header className="flex justify-between items-center p-4">
                <div className="text-xl font-semibold">IBM Cloud</div>
                <nav className="space-x-6">
                    <a href="#" className="text-gray-300 hover:text-white">
                        Catalog
                    </a>
                    <a href="#" className="text-gray-300 hover:text-white">
                        Cost estimator
                    </a>
                    <a href="#" className="text-gray-300 hover:text-white">
                        Docs
                    </a>
                </nav>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto p-8">
                <div className="flex gap-12">
                    {/* Left Column - Form */}
                    <div className="w-1/2">
                        <h1 className="text-3xl font-light mb-2">
                            Create an IBM <span className="font-normal">Cloud</span> account
                        </h1>
                        <p className="text-gray-400 mb-8">
                            Already have an IBM Cloud account?{" "}
                            <a href="#" className="text-blue-400">
                                Log in
                            </a>
                        </p>

                        <div className="space-y-6">
                            {/* Account Information Section */}
                            <div className="bg-zinc-900 p-6 rounded">
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="font-medium">Account information</span>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm mb-1">Email</label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full bg-black border border-gray-700 rounded p-2 pr-10"
                                            />
                                            {/* {email && <CheckCircle2 className="absolute right-3 top-3 text-green-500" size={16} />} */}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm mb-1">Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full bg-black border border-gray-700 rounded p-2 pr-10"
                                            />
                                            <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400">
                                                {showPassword ? <EyeSlashFilled size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>

                                    <button className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2">
                                        Next <ChevronDown className="rotate-270" size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Other Sections */}
                            <div className="bg-zinc-900 p-6 rounded opacity-50">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                                    <span>Verify email</span>
                                </div>
                            </div>

                            <div className="bg-zinc-900 p-6 rounded opacity-50">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                                    <span>Personal information</span>
                                </div>
                            </div>

                            <div className="bg-zinc-900 p-6 rounded opacity-50">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                                    <span>Account notice</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Benefits */}
                    <div className="w-1/2 space-y-8">
                        <div className="space-y-2">
                            <h2 className="text-xl flex items-center gap-2">Unlock the full IBM Cloud Catalog</h2>
                            <p className="text-gray-400">
                                Get started with everything you need to take your projects to the next level. Including always-free products like IBM
                                Watson® APIs. They never expire and you can't be charged for them—ever.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-xl">200 USD Cloud Credit for free</h2>
                            <p className="text-gray-400">Try any IBM Cloud product with $200 in credit to use over the next 30 days.</p>
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-xl">Get started for free</h2>
                            <p className="text-gray-400">
                                We ask for your credit card to verify your identity. You will not be charged for any usage within the free tier. Learn
                                more: www.ibm.com/cloud/free.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
