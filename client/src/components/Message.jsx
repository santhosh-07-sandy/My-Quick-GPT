import React, { useEffect } from 'react'
import { assets } from '../assets/assets'
import moment from 'moment'
import Markdown from 'react-markdown'
import Prism from 'prismjs'

const Message = ({ message }) => {

  useEffect(() => {
    Prism.highlightAll()
  }, [message.content])

  return (
    <div className='w-full'>
      {message.role === "user" ? (
        <div className='flex items-start justify-end my-4 gap-2 max-w-full'>
          <div className='flex flex-col gap-1 p-2 px-3 sm:px-4 bg-slate-50 dark:bg-[#57317C]/30 border border-[#80609F]/30 rounded-md max-w-[85vw] sm:max-w-2xl min-w-0'>
            <p className='text-sm dark:text-primary'>{message.content}</p>
            <span className='text-[10px] text-gray-400 dark:text-[#B1A6C0] text-right'>
              {moment(message.timestamp).format('MMM D, YYYY · hh:mm A')}</span>
          </div>
          <img src={assets.user_icon} alt="" className='w-8 rounded-full' />
        </div>
      )
        :
        (
          <div className='inline-flex flex-col gap-1 p-2 px-3 sm:px-4 max-w-[85vw] sm:max-w-2xl bg-primary/20 dark:bg-[#57317C]/30 border border-[#80609F]/30 rounded-md my-4 min-w-0'>
            {message.isImage ? (
              <img src={message.content} alt="" className='w-full max-w-full sm:max-w-md mt-2 rounded-md' />
            ) :
              (
                <div className='text-sm dark:text-primary reset-tw'>
                  <Markdown>{message.content}</Markdown></div>
              )}
            <span className='text-[10px] text-gray-400 dark:text-[#B1A6C0]'>
              {moment(message.timestamp).format('MMM D, YYYY · hh:mm A')}</span>
          </div>
        )
      }
    </div>
  )
}

export default Message

