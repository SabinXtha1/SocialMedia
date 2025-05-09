
import { getPost } from '@/action/post.action'
import { getDbUserId } from '@/action/user.action'
import CreatePost from '@/components/CreatePost'
import PostCard from '@/components/PostCard'
import WhoToFollow from '@/components/WhoToFollow'
import { currentUser } from '@clerk/nextjs/server'
import React from 'react'

const page = async() => {
  const user = await currentUser()
  const posts = await getPost()
   const dbUserId= await getDbUserId()

    return (
    <div  className="grid grid-cols-1 lg:grid-cols-10 gap-6" >
    <div className="lg:col-span-6">
      {user ?
       <CreatePost/>:null
      } 
      <div className='space-y-6'>
       {
posts.map((post)=>(
  <PostCard key={post.id} post={post} dbUserId={dbUserId} />
))
       }
      </div>
    </div>
    <div>
      
        <WhoToFollow/>
    
    </div>

</div>
  )
}

export default page