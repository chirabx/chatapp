router.post("/send-request", auth, friendController.sendFriendRequest);
router.put("/requests/:requestId", auth, friendController.respondToFriendRequest);
router.put("/requests/mark-read", auth, friendController.markRequestsAsRead); 