'use server'

import prisma from "@/lib/prisma";
import {auth,currentUser} from '@clerk/nextjs/server'
import { revalidatePath } from "next/cache";

export async function syncUser() {
    try{
           const {userId} = await auth()
           const user = await currentUser()
           if(!userId|| !user) return;
         const extUser = await prisma.user.findUnique({
            where:{
                clerkId:userId
            }
         })
         if(extUser){
           return  extUser
         }
           const dbUser = await prisma.user.create({
            data:{
                clerkId:userId,
                name:`${user.firstName || ''} ${user.lastName || ""}`,
                username:user.username ?? user.emailAddresses[0].emailAddress.split('@')[0],
                email:user.emailAddresses[0].emailAddress,
                image:user.imageUrl,
            }
           })
           return dbUser
    }catch(err){
       
        

    }
}

export async function getUserByClerkId(clerkId){
  return prisma.user.findUnique({
    where:{
      clerkId
    },
    include:{
      _count:{
      select:{
        posts: true,
        followers:true,
        followings:true,
      },

      },
    },
  })
}


export async function getDbUserId(){
  const {userId:clerkId} = await auth()
  if(!clerkId){
    return null
  }
  const user = await getUserByClerkId(clerkId)
  if(!user){
    throw new Error("User not found")
  }
  return user.id
}

export async function getRandomUser(){
  try{
    const userId= await getDbUserId()
    if(!userId){
      return []
    }
    const randomUser= await prisma.user.findMany({
      where:{
        AND:[
          {NOT:{id:userId}},
          {
            NOT:{
              followers:{
                some:{
                  followerId:userId
                }
              }
            }
          }
        ]
      },
      select:{
        id:true,
        name:true,
        username:true,
        image:true,_count:{
        select:{
          followers:true,

        }
        }
      },take:3,
    })
    return randomUser
  }catch(error){
     
      return [];
  }
}
export async function toogleFollow(targetUserId){
  try{
        const userId = await getDbUserId();
        if(!userId) return
        if(userId===targetUserId) throw new Error("You Can't Follow Your Own Id")
          const exitingFollower = await prisma.follows.findUnique({
             where:{
              followerId_followingId:{
                followerId:userId,
                followingId:targetUserId
              }
             }
          })
      
          
          if(exitingFollower){
              await prisma.follows.delete({
                where:{
                  followerId_followingId:{
                    followerId:userId,
                    followingId:targetUserId
                  }
                 }
              })
          }else{
            await  prisma.$transaction([
              prisma.follows.create({
                data:{
                      followerId:userId,
                      followingId:targetUserId
                }
              }),
              prisma.notification.create({
                data:{
                  type:"FOLLOW",
                  userId:targetUserId,
                  creatorId:userId
                }
              })
            ])
            
          }
          revalidatePath("/")
          return {success:true}
  }catch(error){
             return {
              success:false,
              error:error
             }
  }
}