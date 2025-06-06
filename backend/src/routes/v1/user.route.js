import {Router} from 'express'
import { approveFollowRequest, changePassword, followAnUser, getCurrentUser, getUserProfile, loginUser, logoutUser, makeProfilePrivateOrPublic, makeProfileVerified, refreshAccessToken, registerBasicUserDetails, registerUser, unfollowAnUser, updateAccountDetails, updateBio, updateUserProfilePicture } from '../../controller/user.controller'
import { verifyJWT } from '../../middlewares/auth.middleware'

const router = Router()

router.route('/register').post(
    upload.fields([
        {
            name : 'profilePicture',
            maxCount : 1
        }
    ] , registerUser)
)

router.route('/register-basic').post(verifyJWT,registerBasicUserDetails)
router.route('/login').post(loginUser)
router.route('/logout').post(verifyJWT,logoutUser)
router.route('/refresh-access-token').post(refreshAccessToken)
router.route('/update-account-details').post(verifyJWT,updateAccountDetails)
router.route('/change-password').post(verifyJWT,changePassword)
router.route('/update-profile-picture').post(verifyJWT,updateUserProfilePicture)
router.route('/current-user').post(verifyJWT,getCurrentUser)
router.route('/profile/:id').post(verifyJWT,getUserProfile)

router.route('/update-bio').post(verifyJWT,updateBio)
router.route('/profile-privacy').post(verifyJWT,makeProfilePrivateOrPublic)
router.route('/profile-verification').post(verifyJWT,makeProfileVerified)

router.route('follow-user').post(verifyJWT,followAnUser)
router.route('unfollow-user').post(verifyJWT,unfollowAnUser)
router.route('approve-follow-request').post(verifyJWT,approveFollowRequest)


export default router