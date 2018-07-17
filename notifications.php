<?php

// Quit if no request
if (!isset($_GET['limit']) && !isset($_GET['markRead']) && !isset($_GET['popup'])) {
	exit();
}

// Define IP.Board variables
define('PATH_TO_IPB', 'forum/');
define('IPB_THIS_SCRIPT', 'private');
define('IPS_DEFAULT_PUBLIC_APP', 'chromeextension');
define('NO_SESSION_UPDATE', true);

// Connect to IP.Board
require_once(PATH_TO_IPB.'initdata.php');
require_once(IPS_ROOT_PATH.'sources/base/ipsRegistry.php');
require_once(IPS_ROOT_PATH.'sources/base/ipsController.php');
$registry = ipsRegistry::instance();
$registry->init();

// Get the member data and check if logged in
$memberData =& $registry->member()->fetchMemberData();
if ($memberData['member_id'] == 0) {
	exit();
}

// Set up the notifications library
$classToLoad   = IPSLib::loadLibrary(IPS_ROOT_PATH . '/sources/classes/member/notifications.php', 'notifications');
$notifyLibrary = new $classToLoad($registry);
$notifyLibrary->setMember($memberData);

// Return the notifications
if ((int)$_GET['limit'] > 0) {
	$_data = $notifyLibrary->fetchUnreadNotifications(0, 'notify_sent', 'desc', 0);
	foreach($_data as $key => $notification) {
		//print_r($notification);exit;
		$_data[$key] = array(
			"notify_id"      => $notification["notify_id"], 
			"notify_read"    => $notification["notify_read"],
			"notify_title"   => $notification["notify_title"],
			"notify_url"     => $notification["notify_url"],
			"pp_thumb_photo" => $notification["member"]["pp_thumb_photo"]
		);
	}
	echo json_encode($_data);
}

// Mark a notification as read
if ((int)$_GET['markRead'] > 0) {
	$DB	= $registry->DB();
	$DB->update('inline_notifications', array('notify_read' => 1), 'notify_to_id=' . intval($memberData['member_id']) . ' AND notify_read=0 AND notify_id=' . (int)$_GET['markRead'] );
	$notifyLibrary->rebuildUnreadCount();
}

?>