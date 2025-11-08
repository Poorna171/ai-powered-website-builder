import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Services from "@/pages/Services";
import Projects from "@/pages/Projects";
import Careers from "@/pages/Careers";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import Contact from "@/pages/Contact";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import PostJob from "@/pages/PostJob";
import EditJob from "@/pages/EditJob";
import PostBlog from "@/pages/PostBlog";
import EditBlog from "@/pages/EditBlog";
import ResumeBuilder from "@/pages/ResumeBuilder";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/resume-builder" element={<ResumeBuilder />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/post-job" element={<PostJob />} />
          <Route path="/admin/edit-job/:jobId" element={<EditJob />} />
          <Route path="/admin/post-blog" element={<PostBlog />} />
          <Route path="/admin/edit-blog/:slug" element={<EditBlog />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;