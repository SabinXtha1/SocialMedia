'use client'

import { useUser } from "@clerk/nextjs"
import { useState } from "react"
import { Card, CardContent } from "./ui/card"
import { Avatar, AvatarImage } from "@radix-ui/react-avatar"
import { Textarea } from "./ui/textarea"
import { Button } from "./ui/button"
import { ImageIcon, Loader2Icon, SendIcon } from "lucide-react"
import { createPost } from "@/action/post.action"
import toast from "react-hot-toast"
import ImageUpload from "./ImageUpload"

const CreatePost = () => {
    const {user} = useUser()
    const [content, setcontent] = useState('')
    const [imageUrl, setimageUrl] = useState('')
    const [isPosting, setisPosting] = useState(false)
     const [showImageUpload, setshowImageUpload] = useState(false)
     const handleSubmit=async()=>{
    if(!content.trim() && !imageUrl) return
    setisPosting(true)
    try{
      const result = await createPost(content,imageUrl)
      if(result.success){
        setcontent('')
        setimageUrl('')
        setisPosting(false)
        toast.success('Post Uploaded Sucessfully')
      }
    }catch(err){
        toast.error("Failed to create post")
         setisPosting(false)
    }
    
    }
  return (
    <div>
     <Card className='mb-6'>
        <CardContent className='pt-6'>
            <div className="space-y-4">
                <div className="flex space-x-4">

                <Avatar className="w-10 h-10">
                    <AvatarImage src={user?.imageUrl || 'https://github.com/shadcn.png'} className="w-10 h-10"/>
                </Avatar>
                <Textarea placeholder="What's on your mind?" className='min-h-[100px] resize-none border-none focus-visible:ring-0 p-0 text-base '
                value={content}
                onChange={(e)=>setcontent(e.target.value)}
                disabled={isPosting}/>
            </div>
       {
        (showImageUpload || imageUrl) &&(
          <div className="border rounded-lg p-4">
            <ImageUpload endpoint='postImage'
            value={imageUrl}
            onChange={(url)=>{
              setimageUrl(url)
              if(!url) setshowImageUpload(false)
            }} />
            </div>
        )
       }

            <div className="flex items-center justify-between border-t pt-4">
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary"
                onClick={() => setshowImageUpload(!showImageUpload)}
                disabled={isPosting}
                >
                <ImageIcon className="size-4 mr-2" />
                Photo
              </Button>
            </div>
            <Button
              className="flex items-center"
              onClick={handleSubmit}
              disabled={(!content.trim() && !imageUrl) || isPosting}
              >
              {isPosting ? (
                  <>
                  <Loader2Icon className="size-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                  <>
                  <SendIcon className="size-4 mr-2" />
                  Post
                </>
              )}
            </Button>
          </div>
              </div>
     
        </CardContent>
     </Card>
    </div>
  )
}

export default CreatePost