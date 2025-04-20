<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = [
        'action_type', 'entity_id', 'entity_type', 'user_id', 'notified_user_id', 'message', 'read_status'
    ];

    /**
     * Create a notification for the specified action.
     *
     * @param string $actionType
     * @param int $entityId
     * @param string $entityType
     * @param int $userId
     * @param int $notifiedUserId
     * @param string $message
     * @return void
     */
    public static function createNotification($actionType, $entityId, $entityType, $userId, $notifiedUserId, $message)
    {
        self::create([
            'action_type' => $actionType,
            'entity_id' => $entityId,
            'entity_type' => $entityType,
            'user_id' => $userId,
            'notified_user_id' => $notifiedUserId,
            'message' => $message,
            'read_status' => false,
        ]);
    }
}
