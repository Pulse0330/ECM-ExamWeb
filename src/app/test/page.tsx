// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { AdvancedExamProctor } from "@/components/question/examguard";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Switch } from "@/components/ui/switch";
// import { Label } from "@/components/ui/label";
// import { Slider } from "@/components/ui/slider";
// import { toast } from "sonner";
// import { Shield, Play, Settings } from "lucide-react";

// export default function ExamGuardTestPage() {
//   const router = useRouter();
//   const [examStarted, setExamStarted] = useState(false);
//   const [showSettings, setShowSettings] = useState(true);

//   // Settings
//   const [maxViolations, setMaxViolations] = useState(3);
//   const [enableWebcam, setEnableWebcam] = useState(false);
//   const [strictMode, setStrictMode] = useState(true);
//   const [enableFullscreen, setEnableFullscreen] = useState(true);

//   // Mock data
//   const userId = "user-123";
//   const examId = "exam-456";

//   const handleStartExam = () => {
//     setExamStarted(true);
//     setShowSettings(false);
//     toast.success("🎯 Шалгалт эхэллээ!");
//   };

//   const handleSubmitExam = () => {
//     toast.success("✅ Шалгалт амжилттай дууслаа!");
//     console.log("📝 Exam submitted by user:", userId);

//     // Simulate navigation to results page
//     setTimeout(() => {
//       setExamStarted(false);
//       setShowSettings(true);
//       toast.info("Үр дүн хуудас руу шилжиж байна...");
//     }, 1000);
//   };

//   const handleLogout = () => {
//     console.log("🚪 User logged out:", userId);
//     toast.info("Системээс гарлаа");
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
//       {/* Exam Guard Component */}
//       {examStarted && (
//         <AdvancedExamProctor

//           onSubmit={handleSubmitExam}
//           onLogout={handleLogout}
//           maxViolations={maxViolations}
//           enableWebcam={enableWebcam}
//           strictMode={strictMode}
//           enableFullscreen={enableFullscreen}
//         />
//       )}

//       <div className="container max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
//         {/* Header */}
//         <div className="mb-8 text-center">
//           <div className="flex items-center justify-center gap-3 mb-4">
//             <Shield className="w-10 h-10 text-blue-600" />
//             <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//               Exam Guard Test
//             </h1>
//           </div>
//           <p className="text-muted-foreground">
//             Шалгалтын хамгаалалтын системийг туршиж үзэх хуудас
//           </p>
//         </div>

//         {!examStarted ? (
//           <div className="grid gap-6 lg:grid-cols-2">
//             {/* Settings Card */}
//             <Card className="shadow-lg">
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Settings className="w-5 h-5" />
//                   Тохиргоо
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 {/* Max Violations */}
//                 <div className="space-y-2">
//                   <Label className="text-base">
//                     Дээд зөрчлийн тоо: <span className="font-bold text-blue-600">{maxViolations}</span>
//                   </Label>
//                   <Slider
//                     value={[maxViolations]}
//                     onValueChange={(v) => setMaxViolations(v[0])}
//                     min={1}
//                     max={10}
//                     step={1}
//                     className="w-full"
//                   />
//                   <p className="text-xs text-muted-foreground">
//                     {maxViolations} удаа ноцтой зөрчил хийвэл шалгалт автоматаар дуусна
//                   </p>
//                 </div>

//                 {/* Enable Webcam */}
//                 <div className="flex items-center justify-between space-x-2 p-4 rounded-lg bg-muted/50">
//                   <div className="space-y-0.5 flex-1">
//                     <Label className="text-base font-medium">Вэб камер идэвхжүүлэх</Label>
//                     <p className="text-xs text-muted-foreground">
//                       Камераар ажиглах боломжтой
//                     </p>
//                   </div>
//                   <Switch
//                     checked={enableWebcam}
//                     onCheckedChange={setEnableWebcam}
//                   />
//                 </div>

//                 {/* Strict Mode */}
//                 <div className="flex items-center justify-between space-x-2 p-4 rounded-lg bg-muted/50">
//                   <div className="space-y-0.5 flex-1">
//                     <Label className="text-base font-medium">Хатуу горим</Label>
//                     <p className="text-xs text-muted-foreground">
//                       Хулгана, tab солих, DevTools зэргийг шалгана
//                     </p>
//                   </div>
//                   <Switch
//                     checked={strictMode}
//                     onCheckedChange={setStrictMode}
//                   />
//                 </div>

//                 {/* Fullscreen Mode */}
//                 <div className="flex items-center justify-between space-x-2 p-4 rounded-lg bg-muted/50">
//                   <div className="space-y-0.5 flex-1">
//                     <Label className="text-base font-medium">Fullscreen горим</Label>
//                     <p className="text-xs text-muted-foreground">
//                       Заавал fullscreen горимд байх ёстой
//                     </p>
//                   </div>
//                   <Switch
//                     checked={enableFullscreen}
//                     onCheckedChange={setEnableFullscreen}
//                   />
//                 </div>

//                 {/* Start Button */}
//                 <Button
//                   onClick={handleStartExam}
//                   className="w-full h-12 text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
//                   size="lg"
//                 >
//                   <Play className="w-5 h-5 mr-2" />
//                   Шалгалт эхлүүлэх
//                 </Button>
//               </CardContent>
//             </Card>

//             {/* Info Card */}
//             <Card className="shadow-lg">
//               <CardHeader>
//                 <CardTitle>📋 Хамгаалалтын онцлог</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="space-y-3">
//                   <FeatureItem
//                     icon="🚫"
//                     title="Tab солих хориглох"
//                     description="Өөр цонх руу шилжвэл автоматаар тэмдэглэнэ"
//                     severity="high"
//                   />
//                   <FeatureItem
//                     icon="🖥️"
//                     title="Fullscreen горим"
//                     description="Заавал fullscreen горимд байх ёстой"
//                     severity="high"
//                   />
//                   <FeatureItem
//                     icon="🛠️"
//                     title="DevTools илрүүлэлт"
//                     description="Developer Tools нээвэл мэдэгдэнэ"
//                     severity="high"
//                   />
//                   <FeatureItem
//                     icon="📷"
//                     title="Вэб камер"
//                     description="Камераар шалгалт өгч буйг хянана"
//                     severity="medium"
//                   />
//                   <FeatureItem
//                     icon="🖱️"
//                     title="Хулгана хяналт"
//                     description="Хулгана цонхноос гадагш гарвал анхааруулна"
//                     severity="medium"
//                   />
//                   <FeatureItem
//                     icon="⌨️"
//                     title="Keyboard хориг"
//                     description="F12, Ctrl+C, Ctrl+V зэрэг хориглоно"
//                     severity="low"
//                   />
//                   <FeatureItem
//                     icon="🖼️"
//                     title="Screenshot хориг"
//                     description="PrintScreen дарах хориотой"
//                     severity="low"
//                   />
//                   <FeatureItem
//                     icon="📝"
//                     title="Copy/Paste хориг"
//                     description="Хуулах, буулгах үйлдэл хориотой"
//                     severity="low"
//                   />
//                 </div>

//                 <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
//                   <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
//                     ⚠️ Анхааруулга
//                   </p>
//                   <p className="text-xs text-yellow-700 dark:text-yellow-300">
//                     Зөрчил хийх бүрт анхааруулга гарна. Дээд хязгаарт хүрвэл шалгалт автоматаар дуусна.
//                   </p>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         ) : (
//           /* Exam Content */
//           <div className="space-y-6">
//             <Card className="shadow-lg">
//               <CardHeader>
//                 <CardTitle>📝 Жишээ Шалгалт</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 <div className="prose dark:prose-invert max-w-none">
//                   <h3>Шалгалтын зааварчилгаа:</h3>
//                   <ul>
//                     <li>Та дараах зүйлийг туршиж үзээрэй:</li>
//                     <li>🚫 Өөр tab руу шилжих (Alt+Tab эсвэл хулганаар)</li>
//                     <li>🚫 F12 дарж DevTools нээх оролдлого</li>
//                     <li>🚫 Баруун товч дарах</li>
//                     <li>🚫 Ctrl+C / Ctrl+V дарах</li>
//                     <li>🚫 Fullscreen-ээс гарах (ESC дарах)</li>
//                     <li>🚫 Хулганы cursor-ыг цонхноос гадагш гаргах</li>
//                   </ul>

//                   <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg my-4">
//                     <h4 className="text-blue-900 dark:text-blue-100 mt-0">💡 Зөвлөмж</h4>
//                     <p className="text-sm text-blue-800 dark:text-blue-200 mb-0">
//                       Баруун дээд буланд танай зөрчлийн тоо харагдаж байна.
//                       Developer console (F12) нээгээд violation түүхийг харж болно.
//                     </p>
//                   </div>

//                   <h3>Жишээ асуултууд:</h3>
//                   <div className="space-y-4">
//                     <div className="p-4 bg-muted rounded-lg">
//                       <p className="font-semibold">1. Монгол Улсын нийслэл хот хаана байрладаг вэ?</p>
//                       <div className="mt-2 space-y-2">
//                         <label className="flex items-center gap-2">
//                           <input type="radio" name="q1" />
//                           <span>А) Улаанбаатар</span>
//                         </label>
//                         <label className="flex items-center gap-2">
//                           <input type="radio" name="q1" />
//                           <span>Б) Дархан</span>
//                         </label>
//                         <label className="flex items-center gap-2">
//                           <input type="radio" name="q1" />
//                           <span>В) Эрдэнэт</span>
//                         </label>
//                       </div>
//                     </div>

//                     <div className="p-4 bg-muted rounded-lg">
//                       <p className="font-semibold">2. 2 + 2 = ?</p>
//                       <input
//                         type="text"
//                         className="mt-2 px-3 py-2 border rounded-lg w-full max-w-xs"
//                         placeholder="Хариултаа бичнэ үү..."
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 <Button
//                   onClick={handleSubmitExam}
//                   className="w-full h-12 text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
//                   size="lg"
//                 >
//                   ✅ Шалгалт дуусгах
//                 </Button>
//               </CardContent>
//             </Card>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // Feature Item Component
// interface FeatureItemProps {
//   icon: string;
//   title: string;
//   description: string;
//   severity: "high" | "medium" | "low";
// }

// function FeatureItem({ icon, title, description, severity }: FeatureItemProps) {
//   const severityColors = {
//     high: "bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800",
//     medium: "bg-orange-100 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800",
//     low: "bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
//   };

//   return (
//     <div className={`p-3 rounded-lg border ${severityColors[severity]}`}>
//       <div className="flex items-start gap-3">
//         <span className="text-2xl">{icon}</span>
//         <div className="flex-1 min-w-0">
//           <p className="font-semibold text-sm">{title}</p>
//           <p className="text-xs text-muted-foreground mt-1">{description}</p>
//         </div>
//         <span className={`text-xs px-2 py-1 rounded-full font-medium ${
//           severity === "high" ? "bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200" :
//           severity === "medium" ? "bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200" :
//           "bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200"
//         }`}>
//           {severity}
//         </span>
//       </div>
//     </div>
//   );
// }
