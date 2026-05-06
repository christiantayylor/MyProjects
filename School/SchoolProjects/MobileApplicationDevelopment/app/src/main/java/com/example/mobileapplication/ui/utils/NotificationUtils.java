import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;

public class NotificationUtils {
    public static void scheduleExcursionNotification(Context context, int excursionId, String date, String message) {
        Intent intent = new Intent(context, NotificationReceiver.class);
        intent.putExtra("message", message);
        PendingIntent pendingIntent = PendingIntent.getBroadcast(context, excursionId, intent, PendingIntent.FLAG_UPDATE_CURRENT);

        try {
            Date excursionDate = new SimpleDateFormat("yyyy-MM-dd").parse(date);
            Calendar cal = Calendar.getInstance();
            cal.setTime(excursionDate);

            AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            alarmManager.set(AlarmManager.RTC_WAKEUP, cal.getTimeInMillis(), pendingIntent);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
