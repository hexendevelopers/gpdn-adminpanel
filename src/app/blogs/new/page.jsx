"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import Image from "next/image";
import axios from "axios";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const NewBlogPage = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [description, setDescription] = useState(""); 
  const [category, setCategory] = useState(""); 
  const [blogImage, setBlogImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBlogImage(reader.result); // Stores base64 string
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const blogData = {
        title: title.trim(),
        content: content.trim(),
        description: description.trim(),
        category: category.trim(),
        authorId: "661055cb1d7f3d2a749e1a88",
        imageURL: blogImage // This is the base64 string
      };

      // Make API call with JSON data
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/blog/AddNewsAndBlogs`,
        blogData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        console.log("Blog submitted successfully:", response.data);
        setSuccess("Blog published successfully!");
        
        // Reset form
        setTitle("");
        setContent("");
        setDescription("");
        setCategory("");
        setBlogImage(null);
        setImagePreview(null);
      } else {
        setError("Failed to save blog: " + response.data.message);
      }
    } catch (error) {
      console.error("Error submitting blog:", error);
      setError(
        `Failed to publish blog: ${
          error.response?.data?.message || error.message || 'Server not responding'
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="w-full h-full p-8 pr-28">
      <div className="h-full w-full flex flex-col justify-between">
        <h1 className="text-2xl font-bold mb-6 text-secondary">
          Write a New Blog
        </h1>
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}
        
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Blog Description"
              className="w-full border border-gray-300 rounded px-4 py-2 text-lg outline-none"
              required
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded px-4 py-2 text-lg outline-none"
              required
            >
              <option value="">Select Category</option>
              <option value="Technology">Technology</option>
              <option value="Health">Health</option>
              <option value="Business">Business</option>
              <option value="Lifestyle">Lifestyle</option>
              <option value="Education">Education</option>
              <option value="Other">Other</option>
            </select>
            
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
              Upload Blog Image
            </label>
            <input
              type="file"
              id="blog-image"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-white hover:file:bg-secondary-dark"
            />
            {imagePreview && (
              <div className="w-full max-w-md h-64 mt-2">
                <Image
                  src={imagePreview}
                  width={400}
                  height={300}
                  alt="Blog preview"
                  priority={true}
                  className="h-full w-full rounded-md border object-cover"
                />
              </div>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 bg-primary text-white font-semibold rounded-lg ${
              isSubmitting ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? "Publishing..." : "Publish Blog"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default NewBlogPage;