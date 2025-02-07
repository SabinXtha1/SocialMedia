'use client'

import { useState } from "react"
import { Button } from "./ui/button"
import { Loader2Icon } from "lucide-react"
import { toogleFollow } from "@/action/user.action"
import toast from "react-hot-toast"

const FollowButton = ({userID}) => {
    const [isLoading, setisLoading] = useState(false)
    const handleFollow = async ()=>{
        setisLoading(true)
        try{
        await toogleFollow(userID)
        toast.success("User followed Succesfully")
      }catch{
         toast.error("Error following User")
        
      }finally{
          setisLoading(false)

        }
    }
  return (
 <Button
 size={'sm'}
 variant={"secondary"}
 onClick={handleFollow}
 disable={isLoading}
 className={'w-20'}>
    {isLoading ? <Loader2Icon className="size-4 animate-spin" />: "FOLLOW"}
 </Button>

  )
}

export default FollowButton