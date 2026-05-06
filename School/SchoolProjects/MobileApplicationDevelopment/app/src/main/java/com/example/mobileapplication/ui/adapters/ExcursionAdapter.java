import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import java.util.List;

public class ExcursionAdapter extends RecyclerView.Adapter<ExcursionAdapter.ExcursionViewHolder> {
    private List<Excursion> excursions;
    private AppDatabase db;

    public ExcursionAdapter(List<Excursion> excursions, AppDatabase db) {
        this.excursions = excursions;
        this.db = db;
    }

    @NonNull
    @Override
    public ExcursionViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.excursion_list_item, parent, false);
        return new ExcursionViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ExcursionViewHolder holder, int position) {
        Excursion excursion = excursions.get(position);
        holder.textTitle.setText(excursion.getTitle());
        holder.textDate.setText("Date: " + excursion.getDate());

        holder.itemView.setOnLongClickListener(v -> {
            db.excursionDao().delete(excursion);
            excursions.remove(position);
            notifyDataSetChanged();
            Toast.makeText(v.getContext(), "Excursion Deleted!", Toast.LENGTH_SHORT).show();
            return true;
        });
    }

    @Override
    public int getItemCount() {
        return excursions.size();
    }

    public static class ExcursionViewHolder extends RecyclerView.ViewHolder {
        TextView textTitle, textDate;

        public ExcursionViewHolder(View itemView) {
            super(itemView);
            textTitle = itemView.findViewById(R.id.textExcursionTitle);
            textDate = itemView.findViewById(R.id.textExcursionDate);
        }
    }
}
