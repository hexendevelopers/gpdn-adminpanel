"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const EditBlogPage = () => {
  const { blogId } = useParams();
  const router = useRouter();
  
  // Add this effect to suppress the warning
  useEffect(() => {
    const originalWarn = console.warn;
    console.warn = (...args) => {
      if (args[0]?.includes('DOMNodeInserted')) return;
      originalWarn.apply(console, args);
    };
    return () => {
      console.warn = originalWarn;
    };
  }, []);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [blogImage, setBlogImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Add these state variables at the top with other useState declarations
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const fetchBlog = async () => {
      setIsLoading(true);
      try {
        // Keep the fetch endpoint
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/blog/FetchNewsAndBlogs`);
        
        const blog = response.data.data.find(blog => blog._id === blogId);
        
        if (blog) {
          setTitle(blog.title);
          setContent(blog.content);
          setCategory(blog.category || "");
          setDescription(blog.description || "");
          setCurrentImageUrl(blog.imageUrl);
          
          if (blog.imageUrl) {
            setImagePreview(blog.imageUrl);
          }
        } else {
          setError("Blog not found");
        }
      } catch (error) {
        console.error("Error fetching blog:", error);
        setError("Failed to load blog details");
      } finally {
        setIsLoading(false);
      }
    };

    if (blogId) {
      fetchBlog();
    }
  }, [blogId]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBlogImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      
      // Ensure all required fields are present
      const blogData = {
        _id: blogId,
        title: title.trim(),
        content: content.trim(),
        description: description.trim(),
        category: category.trim(),
        imageUrl: currentImageUrl,
        // Remove empty tags array if not needed
        // tags: [],
      };

      console.log('Sending request to:', `${baseUrl}/api/blog/EditNewsAndBlogs`);
      console.log('Request Data:', JSON.stringify(blogData, null, 2));

      const response = await axios.patch(
        `${baseUrl}/api/blog/EditNewsAndBlogs`,
        blogData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          validateStatus: function (status) {
            return status >= 200 && status < 500; // Don't reject if status is 400
          },
          timeout: 10000
        }
      );
      
      console.log('Full Response:', {
        status: response.status,
        data: response.data,
        headers: response.headers
      });

      // Check the success flag in the response data
      if (response.data.success) {
        alert("Blog updated successfully!");
        router.push("/blogs");
      } else {
        // API returned success: false
        throw new Error(
          response.data.message || 
          response.data.error || 
          `Update failed: ${response.data.status || response.status}`
        );
      }
      
    } catch (error) {
      console.error("Full error object:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      setError(
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message || 
        'Failed to update the blog. Please check all fields and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
      </div>
    );
  }

  return (
    <section className="w-full h-full p-8 pr-28">
      <div className="h-full w-full flex flex-col justify-between">
        <h1 className="text-2xl font-bold mb-6 text-secondary">
          Edit Blog
        </h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Blog Title"
              className="w-full border border-gray-300 rounded px-4 py-2 text-3xl outline-none"
              required
            />

            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Category (e.g., Technology, Health, etc.)"
              className="w-full border border-gray-300 rounded px-4 py-2 outline-none"
              required
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the blog post"
              className="w-full border border-gray-300 rounded px-4 py-2 outline-none resize-none h-24"
              required
            />

            <ReactQuill
              value={content}
              onChange={setContent}
              className="bg-white border-none rounded-lg h-[50vh] pb-10"           
              placeholder="Write your blog content here..."
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label
              className="block text-sm font-semibold text-secondary"
              htmlFor="blog-image"
            >
              Blog Image
            </label>
            
            {/* Show existing image preview if available */}
            {imagePreview && (
              <div className="w-full max-w-md h-64 mb-2">
                <Image
                  src={imagePreview}
                  width={400}
                  height={300}
                  alt="Blog preview"
                  className="h-full w-full rounded-md border object-cover"
                />
              </div>
            )}
            
            <input
              type="file"
              id="blog-image"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-white hover:file:bg-secondary-dark"
            />
            <p className="text-xs text-gray-500">Leave empty to keep current image</p>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 bg-primary text-white font-semibold rounded-lg ${
                isSubmitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "Updating..." : "Update Blog"}
            </button>
            
            <button
              type="button"
              onClick={() => router.push("/blogs")}
              className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default EditBlogPage;