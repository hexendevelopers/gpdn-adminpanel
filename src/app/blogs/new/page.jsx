"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import Image from "next/image";
import axios from "axios";
import { useRouter } from 'next/navigation';

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const NewBlogPage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [description, setDescription] = useState("");
  const [blogImage, setBlogImage] = useState(null);
  const [category, setCategory] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [tags, setTags] = useState(""); // Add tags state

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setBlogImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imageURL = "";
      
      if (blogImage) {
        imageURL = await convertToBase64(blogImage);
      }

      const blogData = {
        title,
        content,
        description,
        category,
        authorId: "661055cb1d7f3d2a749e1a88",
        imageURL,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ""),
      };

      // Updated with correct API endpoint
      const response = await axios.post(
        'https://gpdn-global-palliative-doctors-network.onrender.com/api/admin/AddNewsAndBlogs',
        blogData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );

      if (response.data.success) {
        alert('Blog posted successfully!');
        router.push('/blogs');
      }
    } catch (error) {
      console.error("Error submitting blog:", error);
      alert(`Failed to post blog: ${error.message}`);
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
              className="w-full border border-gray-300 rounded px-4 py-2 outline-none"
              required
            />

            {/* Changed from dropdown to input box */}
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Category"
              className="w-full border border-gray-300 rounded px-4 py-2 outline-none"
              required
            />

            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Add tags (comma-separated e.g., health, medicine, research)"
              className="w-full border border-gray-300 rounded px-4 py-2 outline-none"
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
              <div className="w-[30vw] h-[30vh]">
                <Image
                  src={imagePreview}
                  width={100}
                  height={100}
                  alt="Selected blog"
                  className="h-full w-full rounded-md border object-cover"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-primary text-white font-semibold rounded-lg disabled:opacity-50"
          >
            {isSubmitting ? 'Publishing...' : 'Publish Blog'}
          </button>
        </form>
      </div>
    </section>
  );
};

export default NewBlogPage;