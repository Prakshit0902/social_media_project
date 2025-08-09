import {Router} from 'express'
import { approveFollowRequest, changePassword, exploreSection, followAnUser, getCurrentUser, getUserProfile, getUserProfilesById, loginUser, logoutUser, makeProfilePrivateOrPublic, makeProfileVerified, postFeeds, refreshAccessToken, registerBasicUserDetails, registerUser, rejectFollowRequest, searchUsers, unfollowAnUser, updateAccountDetails } from '../../controller/user.controller.js'
import { verifyJWT } from '../../middlewares/auth.middleware.js'    
import {upload} from "../../middlewares/multer.middleware.js"

const router = Router()

router.route('/register-basic').patch(verifyJWT,
    upload.fields([
        {
            name : 'profilePicture',
            maxCount : 1
        }
    ]) , registerBasicUserDetails)
    
router.route('/current-user').get(verifyJWT,getCurrentUser) 

router.route('/register').post(registerUser)
router.route('/login').post(loginUser)
router.route('/logout').post(verifyJWT,logoutUser)
router.route('/refresh-access-token').post(refreshAccessToken)
router.route('/update-account-details').patch(verifyJWT,updateAccountDetails)
router.route('/change-password').post(verifyJWT,changePassword)
// router.route('/update-profile-picture').post(verifyJWT,updateUserProfilePicture)
router.route('/profile/:identifier').get(verifyJWT,getUserProfile)
router.route('/profiles').post(verifyJWT,getUserProfilesById)

router.route('/profile-privacy').post(verifyJWT,makeProfilePrivateOrPublic)
router.route('/profile-verification').post(verifyJWT,makeProfileVerified)

router.route('/follow-user').post(verifyJWT,followAnUser)
router.route('/unfollow-user').post(verifyJWT,unfollowAnUser)
router.route('/approve-follow-request').post(verifyJWT,approveFollowRequest)
router.route('/reject-follow-request').post(verifyJWT,rejectFollowRequest)

router.route('/explore').get(verifyJWT,exploreSection)
router.route('/post-feed').get(verifyJWT,postFeeds)

router.get("/search", verifyJWT, searchUsers);


export default router