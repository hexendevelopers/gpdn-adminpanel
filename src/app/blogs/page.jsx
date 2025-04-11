'use client';
import Link from "next/link";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import axios from "axios";

const Page = () => {
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Update the placeholder image path
  const placeholderImage = '/images/placeholder.jpg';  // or use an existing image path

  // Function to check if URL is from an external domain
  const isExternalUrl = (url) => {
    if (!url) return false;
    return url.startsWith('http://') || url.startsWith('https://');
  };

  useEffect(() => {
    const fetchBlogs = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await axios.get('/api/blog/FetchNewsAndBlogs');
        console.log("Raw response:", response.data);
        
        // Access the blog data based on the API's response structure
        let blogsData = [];
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
          console.log("Using response.data.data array");
          blogsData = response.data.data;
        } else if (Array.isArray(response.data)) {
          console.log("Response is an array");
          blogsData = response.data;
        } else if (response.data && typeof response.data === 'object') {
          console.log("Response is an object");
          if (response.data.blogs && Array.isArray(response.data.blogs)) {
            console.log("Using response.data.blogs");
            blogsData = response.data.blogs;
          } else if (response.data._id) {
            // Handle single blog object case
            console.log("Treating response as a single blog object");
            blogsData = [response.data];
          } else {
            // Try to extract values if it's an object with blog objects as values
            console.log("Trying to extract values from object");
            const values = Object.values(response.data);
            if (values.length > 0 && typeof values[0] === 'object') {
              blogsData = values;
            } else {
              blogsData = [response.data];
            }
          }
        }
    
        console.log("Processed blogs data:", blogsData);
        
        // Process and validate image URLs
        // Add this function near the top of your component
        const isValidBase64Image = (str) => {
          if (!str?.startsWith('data:image')) return false;
          try {
            // Check if the string is properly formatted
            const [header, content] = str.split(',');
            return header.includes('base64') && content?.length > 0;
          } catch {
            return false;
          }
        };
    
        // Add this utility function at the top of your component
        const optimizeBase64Image = async (base64Str, maxWidth = 800) => {
          return new Promise((resolve) => {
            const img = document.createElement('img'); // Use document.createElement instead of Image constructor
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              
              // Calculate new dimensions maintaining aspect ratio
              let width = img.width;
              let height = img.height;
              if (width > maxWidth) {
                height = (maxWidth * height) / width;
                width = maxWidth;
              }
              
              canvas.width = width;
              canvas.height = height;
              
              // Draw and compress image
              ctx.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL('image/jpeg', 0.7)); // Reduce quality to 70%
            };
            img.src = base64Str;
          });
        };
    
        // Modify the processedBlogs mapping
        const processedBlogs = await Promise.all(blogsData.map(async (blog) => {
          let imageURL = null;
          let isExternal = false;
          
          // Check if imageURL exists and is valid
          if (blog.imageURL) {
            if (blog.imageURL.startsWith('data:image') && isValidBase64Image(blog.imageURL)) {
              // Optimize base64 image
              imageURL = await optimizeBase64Image(blog.imageURL);
            } else if (blog.imageURL.startsWith('/')) {
              imageURL = blog.imageURL;
            } else if (isExternalUrl(blog.imageURL)) {
              imageURL = blog.imageURL;
              isExternal = true;
            }
          }
          
          // Check if image exists and is valid
          if (!imageURL && blog.image) {
            if (blog.image.startsWith('data:image') && isValidBase64Image(blog.image)) {
              // Optimize base64 image
              imageURL = await optimizeBase64Image(blog.image);
            } else if (blog.image.startsWith('/')) {
              imageURL = blog.image;
            } else if (isExternalUrl(blog.image)) {
              imageURL = blog.image;
              isExternal = true;
            }
          }
    
          return {
            ...blog,
            imageURL: imageURL || placeholderImage,
            isExternalImage: isExternal
          };
        }));
    
        setBlogs(processedBlogs);
      } catch (error) {
        console.error("Error fetching blogs:", error);
        if (error.response) {
          console.error("Response error data:", error.response.data);
          console.error("Response error status:", error.response.status);
          setError(`Failed to load blogs: ${error.response.status} - ${error.message}`);
        } else if (error.request) {
          console.error("No response received:", error.request);
          setError("Failed to load blogs: No response received. Is the backend server running?");
        } else {
          setError(`Failed to load blogs: ${error.message}`);
        }
        setBlogs([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBlogs();
  }, []);

  const handleDelete = async (blogId) => {
    try {
      await axios.post('/api/blog/DeleteNewsAndBlogs', {
        BlogId: blogId
      });
      alert("Blog deleted successfully");
      const updatedBlogs = blogs.filter(blog => blog._id !== blogId);
      setBlogs(updatedBlogs);
    } catch (error) {
      console.error("Error deleting blog:", error);
      alert(`Failed to delete blog: ${error.message}`);
    }
  };

  return (
    <section className="w-full h-full p-8">
      <div className="flex flex-col gap-10">
        <div className="flex justify-between items-center">
          <Link href={"/blogs/new"}>
            <button className="bg-secondary text-white font-semibold rounded-lg py-2 px-3">
              Add new blog
            </button>
          </Link>
          {isLoading && <span className="text-gray-500">Loading...</span>}
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        {!isLoading && !error && blogs.length === 0 ? (
          <div className="text-center py-8 border border-gray-200 rounded-lg">
            No blogs found. Click "Add new blog" to create your first blog post.
          </div>
        ) : (
          <div className="w-full h-auto flex flex-col gap-20 md:gap-10 md:grid md:grid-cols-2 lg:grid-cols-3 grid-flow-row">
            {blogs.map((data, index) => (
              <div
                key={data._id || index}
                className="w-full h-auto flex flex-col justify-between gap-5 border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-full h-[25vh] md:h-auto relative">
                  {data.imageURL ? (
                    <div className="w-full h-[25vh] md:h-auto relative">
                      <img
                        alt={`${data.title || 'Blog'} image`}
                        src={data.imageURL}
                        className="w-full h-full object-cover object-center"
                        onError={(e) => {
                          console.error("Image failed to load:", data.imageURL);
                          e.target.style.display = 'none';
                          const parent = e.target.parentNode;
                          if (parent) {
                            const fallback = document.createElement('div');
                            fallback.className = "w-full h-full bg-gray-200 flex items-center justify-center text-gray-500";
                            fallback.innerText = "No image";
                            parent.appendChild(fallback);
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                      No image available
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 p-4">
                  <div className="flex items-center w-full justify-between">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {data.category || "Uncategorized"}
                    </span>
                    <p className="text-tertiary text-sm font-normal">
                      {data.date || new Date().toLocaleDateString()}
                    </p>
                  </div>
                  <h2 className="text-xl font-semibold text-black mt-2">
                    {data.title || "Untitled"}
                  </h2>
                  <p className="font-normal text-sm text-tertiary w-full mt-1 mb-3">
                    {(data.description && data.description.length > 120)
                      ? data.description
                          .slice(0, 120)
                          .split(" ")
                          .slice(0, -1)
                          .join(" ") + " ..."
                      : data.description || (data.content && data.content.length > 120 
                          ? data.content.slice(0, 120).split(" ").slice(0, -1).join(" ") + " ..." 
                          : data.content) || "No description available"}
                  </p>
                  <div className="w-full flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
                    <Link href={`/blogs/edit/${data._id || index}`}>
                      <button className="bg-black text-white py-1.5 px-3 font-semibold rounded-lg">
                        Edit
                      </button>
                    </Link>
                    <button 
                      onClick={() => handleDelete(data._id || index)} 
                      className="bg-red-600 text-white py-1.5 px-3 font-semibold rounded-lg"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Page;