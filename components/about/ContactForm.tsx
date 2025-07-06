'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitResult(null);
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setSubmitResult({
        success: true,
        message: 'Thank you for your message! I will get back to you soon.',
      });
      
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      setSubmitResult({
        success: false,
        message: 'Something went wrong. Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl">
      <h2 className="font-sans text-2xl font-bold mb-6 text-white">Get in Touch</h2>
      
      {submitResult && (
        <div 
          className={`p-4 mb-6 rounded-lg ${
            submitResult.success ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
          }`}
        >
          {submitResult.message}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label 
            htmlFor="name" 
            className="block font-sans text-sm font-medium text-gray-300 mb-1"
          >
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
          />
        </div>
        
        <div>
          <label 
            htmlFor="email" 
            className="block font-sans text-sm font-medium text-gray-300 mb-1"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
          />
        </div>
        
        <div>
          <label 
            htmlFor="message" 
            className="block font-sans text-sm font-medium text-gray-300 mb-1"
          >
            Message
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={5}
            className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-4 flex items-center justify-center font-sans font-medium text-white bg-blue-600/80 backdrop-blur-sm rounded-xl hover:bg-blue-600 transition-all hover:scale-[1.02] duration-300 ${
            isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
          {!isSubmitting && <Send className="ml-2 h-4 w-4" />}
        </button>
      </form>
    </div>
  );
}