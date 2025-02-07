'use server'

import { revalidatePath } from "next/cache"
import { getDbUserId } from "./user.action"
import prisma from "@/lib/prisma"

export async function createPost(content,image){
    try{
        const userId = await getDbUserId()
        if(!userId) return;
        const post = await prisma.post.create({
            data:{
                content,
               image,
               authorId:userId,


            }
        })
        revalidatePath('/')
        return {
            success:true,post
        }
    }catch(error){
        return {
            success:false,error
        }
    }
}

export async function getPost(){
     try{
       const posts = await prisma.post.findMany({
        orderBy:{
            createdAt:"desc"
        },
        include:{
            author:{
                select:{
                    id:true,
                    name:true,
                    image:true,
                    username:true
                }
            },
            comments:{
                include:{
                    author:{
                        select:{
                            id:true,
                            username:true,
                            image:true,
                            name:true
                        }
                    }
                },
                orderBy:{
                    createdAt:"asc"
                }
            },likes:{
               select:{
                userId:true
               }
            },
            _count:{
                select:{
                    likes:true,
                    comments:true
                }
            }

        }
       })
      
       return posts
     }catch(error){
      
          throw new Error("Failed to fetch posts")
          
     }
}


export async function toggleLike(postId){
    try{
     const userId = await getDbUserId()
     if(!userId) return;
     const exitingLike = await prisma.like.findUnique({
        where:{
            userId_postId:{
                userId,
                postId
            }
        }
     })
     const post = await prisma.post.findUnique({
        where:{
            id:postId
        },
        select:{
            author:true
        }
     })
     if(!post) throw new Error("Post not Found")
        if(exitingLike){
            await prisma.like.delete({
                where:{
                    userId_postId:{
                        userId,
                        postId
                    }
                },
            })
        }else{
            await prisma.$transaction([
                prisma.like.create({
                    data:{
                        userId,
                        postId
                    },
                }),
                ...(post.authorId!==userId?[
                    prisma.notification.create({
data:{
      type:"LIKE",
      userId:post.authorId,
      creatorId:userId,
      postId
},
                    })
                ]:[])
            ])
        }
        revalidatePath('/')
        return {
            success:true
        }
    }catch(error){
         return {
            success:false,
            error:error
         }
    }
}

export async function createComment(postId,content){
       try{
       const userId= await getDbUserId()
       if(!userId) return;
       if(!content) throw new Error("Content is required")
        const post= await prisma.post.findUnique({
    where:{
        id:postId
    },
    select:{
        authorId:true
    }
    })

       if(!post) throw new Error("Post Not Found")
        const[comment]= await prisma.$transaction(async (tx)=>{
          const newComment = await tx.comment.create({
            data:{
                content,
                authorId:userId,
                postId
            }
        })
        if(post.authorId !== userId){
              await tx.notification.create({
                data:{
                    type:"COMMENT",
                    userId:post.authorId,
                    postId,
                    commentId:newComment.id
                }
              })
        }
        return [newComment]
    })
    revalidatePath('/')
    return {
        success:true,
        comment
    }

       }catch(error){
    
      return {
        success:false,
        error:error
      }
      
       }

}

export async function deletePost(postId){
    try{
   const userID= await getDbUserId()
   const post = await prisma.post.findUnique({
    where:{
        id:postId,
    },
        select:{
            authorId:true
    }
   })
  
   
   if(!post) throw new Error('Post Not Founded')
    if(post.authorId !== userID) throw new Error("You are not the author of this post")
        await prisma.post.delete({
         where:{
            id:postId
         }
        })
        revalidatePath('/')
        return {
            success:true
        }
    }catch(error){
    
      return {
        success:false,
        error:error
      }
    }
}